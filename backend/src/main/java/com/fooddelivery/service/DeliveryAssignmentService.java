package com.fooddelivery.service;

import com.fooddelivery.dto.response.DeliveryAssignmentDTO;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.model.entity.*;
import com.fooddelivery.model.enums.AssignmentStatus;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class DeliveryAssignmentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeliveryAssignmentRepository deliveryAssignmentRepository;

    @Autowired
    private AgentLocationRepository agentLocationRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final double INITIAL_RADIUS_KM = 5.0;
    private static final double EXPANDED_RADIUS_KM = 10.0;
    private static final int TOP_AGENTS_COUNT = 3;
    private static final long ASSIGNMENT_EXPIRY_MINUTES = 2;

    /**
     * Smart delivery agent assignment algorithm
     * 1. Find available agents within 5km radius
     * 2. If not enough agents, expand to 10km
     * 3. Sort by rating and current load
     * 4. Send notifications to top 3 agents
     * 5. First to accept gets the order
     */
    @Transactional
    public void findAndAssignDeliveryAgent(Long orderId) {
        log.info("Finding delivery agent for order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Restaurant restaurant = order.getRestaurant();

        // 1. Find available agents within initial radius
        List<User> availableAgents = findNearbyAvailableAgents(
                restaurant.getLatitude(),
                restaurant.getLongitude(),
                INITIAL_RADIUS_KM
        );

        // 2. If not enough agents, expand search radius
        if (availableAgents.size() < TOP_AGENTS_COUNT) {
            log.warn("Insufficient agents within {}km, expanding search to {}km", INITIAL_RADIUS_KM, EXPANDED_RADIUS_KM);
            availableAgents = findNearbyAvailableAgents(
                    restaurant.getLatitude(),
                    restaurant.getLongitude(),
                    EXPANDED_RADIUS_KM
            );
        }

        if (availableAgents.isEmpty()) {
            log.warn("No available agents found for order: {}", orderId);
            // In production, implement fallback strategy or queue order
            return;
        }

        // 3. Sort agents by priority
        availableAgents = sortAgentsByPriority(availableAgents);

        // 4. Create assignments for top agents
        List<User> topAgents = availableAgents.stream()
                .limit(TOP_AGENTS_COUNT)
                .collect(Collectors.toList());

        List<Long> agentIds = new ArrayList<>();
        for (User agent : topAgents) {
            DeliveryAssignment assignment = new DeliveryAssignment();
            assignment.setOrder(order);
            assignment.setDeliveryAgent(agent);
            assignment.setStatus(AssignmentStatus.PENDING);
            assignment.setAssignedAt(LocalDateTime.now());

            deliveryAssignmentRepository.save(assignment);
            agentIds.add(agent.getId());

            log.info("Assignment created for agent: {} for order: {}", agent.getId(), orderId);
        }

        // 5. Store in Redis with expiry for quick lookups
        String redisKey = "order:pending:" + orderId;
        redisTemplate.opsForValue().set(redisKey, agentIds, ASSIGNMENT_EXPIRY_MINUTES, TimeUnit.MINUTES);

        // 6. In production, send push notifications to agents here
        log.info("Sent assignment notifications to {} agents for order: {}", agentIds.size(), orderId);
    }

    /**
     * Find available agents within given radius
     */
    private List<User> findNearbyAvailableAgents(Double latitude, Double longitude, Double radiusKm) {
        // Get all active delivery agents (in production, use PostGIS geo-spatial queries)
        List<User> allAgents = userRepository.findByRoleAndIsActiveTrue(
                com.fooddelivery.model.enums.UserRole.DELIVERY_AGENT
        );

        return allAgents.stream()
                .filter(agent -> {
                    // Check if agent is online
                    Boolean isOnline = (Boolean) redisTemplate.opsForValue()
                            .get("agent:online:" + agent.getId());
                    return isOnline != null && isOnline;
                })
                .filter(agent -> {
                    // Get agent's current location from Redis or DB
                    AgentLocation location = getAgentCurrentLocation(agent.getId());
                    if (location == null) return false;

                    double distance = calculateDistance(
                            latitude, longitude,
                            location.getLatitude(), location.getLongitude()
                    );
                    return distance <= radiusKm;
                })
                .collect(Collectors.toList());
    }

    /**
     * Sort agents by priority: current load first, then rating
     */
    private List<User> sortAgentsByPriority(List<User> agents) {
        return agents.stream()
                .sorted((a1, a2) -> {
                    // Priority 1: Current active deliveries (less is better)
                    int activeDeliveries1 = getActiveDeliveryCount(a1.getId());
                    int activeDeliveries2 = getActiveDeliveryCount(a2.getId());

                    if (activeDeliveries1 != activeDeliveries2) {
                        return Integer.compare(activeDeliveries1, activeDeliveries2);
                    }

                    // Priority 2: Rating (higher is better)
                    Double rating1 = getAgentRating(a1.getId());
                    Double rating2 = getAgentRating(a2.getId());
                    return Double.compare(rating2, rating1);
                })
                .collect(Collectors.toList());
    }

    /**
     * Accept delivery assignment - atomic operation
     */
    @Transactional
    public DeliveryAssignmentDTO acceptDelivery(Long orderId, Long agentId) {
        log.info("Agent {} accepting delivery for order {}", agentId, orderId);

        // Find and update assignment
        DeliveryAssignment assignment = deliveryAssignmentRepository
                .findByOrderIdAndDeliveryAgentIdAndStatus(orderId, agentId, AssignmentStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignment not found or already accepted for order: " + orderId));

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        DeliveryAssignment acceptedAssignment = deliveryAssignmentRepository.save(assignment);

        // Update order with delivery agent
        Order order = assignment.getOrder();
        order.setDeliveryAgent(assignment.getDeliveryAgent());
        order.setStatus(OrderStatus.ASSIGNED);
        orderRepository.save(order);

        log.info("Order {} assigned to agent {}", orderId, agentId);

        // Reject all other pending assignments for this order
        rejectOtherAssignments(orderId, agentId);

        // Clear Redis entry
        redisTemplate.delete("order:pending:" + orderId);

        return mapToDTO(acceptedAssignment);
    }

    /**
     * Reject delivery assignment
     */
    @Transactional
    public DeliveryAssignmentDTO rejectDelivery(Long orderId, Long agentId, String reason) {
        log.info("Agent {} rejecting delivery for order: {} with reason: {}", agentId, orderId, reason);

        DeliveryAssignment assignment = deliveryAssignmentRepository
                .findByOrderIdAndDeliveryAgentIdAndStatus(orderId, agentId, AssignmentStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRejectedAt(LocalDateTime.now());
        assignment.setRejectionReason(reason);
        DeliveryAssignment rejectedAssignment = deliveryAssignmentRepository.save(assignment);

        // Check if any other agents are pending
        List<DeliveryAssignment> pendingAssignments = deliveryAssignmentRepository
                .findByOrderIdAndStatus(orderId, AssignmentStatus.PENDING);

        if (pendingAssignments.isEmpty()) {
            log.warn("All agents rejected order: {}, re-queuing for assignment", orderId);
            // Re-queue for assignment with expanded search
            findAndAssignDeliveryAgent(orderId);
        }

        return mapToDTO(rejectedAssignment);
    }

    /**
     * Reject all other assignments for an order
     */
    private void rejectOtherAssignments(Long orderId, Long acceptingAgentId) {
        List<DeliveryAssignment> otherAssignments = deliveryAssignmentRepository
                .findByOrderIdAndStatus(orderId, AssignmentStatus.PENDING);

        for (DeliveryAssignment assignment : otherAssignments) {
            if (!assignment.getDeliveryAgent().getId().equals(acceptingAgentId)) {
                assignment.setStatus(AssignmentStatus.CANCELLED);
                assignment.setRejectionReason("Order assigned to another agent");
                deliveryAssignmentRepository.save(assignment);
                log.info("Cancelled assignment for agent {} on order {}", assignment.getDeliveryAgent().getId(), orderId);
            }
        }
    }

    /**
     * Mark delivery as picked up
     */
    public DeliveryAssignmentDTO markAsPickedUp(Long orderId, Long agentId) {
        log.info("Agent {} marking order {} as picked up", agentId, orderId);

        DeliveryAssignment assignment = deliveryAssignmentRepository
                .findByOrderIdAndDeliveryAgentId(orderId, agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        assignment.setPickedUpAt(LocalDateTime.now());
        DeliveryAssignment updatedAssignment = deliveryAssignmentRepository.save(assignment);

        // Update order status
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.PICKED_UP);
        orderRepository.save(order);

        return mapToDTO(updatedAssignment);
    }

    /**
     * Mark delivery as completed
     */
    public DeliveryAssignmentDTO markAsDelivered(Long orderId, Long agentId) {
        log.info("Agent {} marking order {} as delivered", agentId, orderId);

        DeliveryAssignment assignment = deliveryAssignmentRepository
                .findByOrderIdAndDeliveryAgentId(orderId, agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        assignment.setDeliveredAt(LocalDateTime.now());
        assignment.setStatus(AssignmentStatus.COMPLETED);
        DeliveryAssignment completedAssignment = deliveryAssignmentRepository.save(assignment);

        // Update order status
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Order {} delivered by agent {}", orderId, agentId);

        return mapToDTO(completedAssignment);
    }

    /**
     * Get active assignments for an agent
     */
    @Transactional(readOnly = true)
    public Page<DeliveryAssignmentDTO> getAgentAssignments(Long agentId, Pageable pageable) {
        log.info("Fetching assignments for agent: {}", agentId);

        return deliveryAssignmentRepository
                .findByDeliveryAgentIdAndStatusInOrderByAssignedAtDesc(
                        agentId,
                        Arrays.asList(AssignmentStatus.ACCEPTED, AssignmentStatus.PENDING),
                        pageable
                )
                .map(this::mapToDTO);
    }

    /**
     * Get agent's assignments by status
     */
    @Transactional(readOnly = true)
    public Page<DeliveryAssignmentDTO> getAgentAssignmentsByStatus(Long agentId, AssignmentStatus status, Pageable pageable) {
        log.info("Fetching assignments for agent: {} with status: {}", agentId, status);

        return deliveryAssignmentRepository
                .findByDeliveryAgentIdAndStatusInOrderByAssignedAtDesc(
                        agentId,
                        Collections.singletonList(status),
                        pageable
                )
                .map(this::mapToDTO);
    }

    /**
     * Update agent's current location
     */
    @Transactional
    public void updateAgentLocation(Long agentId, Double latitude, Double longitude) {
        log.info("Updating location for agent: {} to ({}, {})", agentId, latitude, longitude);

        // Verify agent exists
        userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        AgentLocation location = AgentLocation.builder()
                .agentId(agentId)
                .latitude(latitude)
                .longitude(longitude)
                .isOnline(true)
                .build();

        agentLocationRepository.save(location);
        log.info("Location updated for agent: {}", agentId);
    }

    /**
     * Get current active delivery count for agent
     */
    private int getActiveDeliveryCount(Long agentId) {
        return (int) deliveryAssignmentRepository
                .findByDeliveryAgentIdAndStatusIn(agentId,
                        Arrays.asList(AssignmentStatus.ACCEPTED, AssignmentStatus.PENDING))
                .size();
    }

    /**
     * Get agent's average rating
     */
    private Double getAgentRating(Long agentId) {
        // In production, calculate from reviews table
        // For now, return default
        return 4.5;
    }

    /**
     * Get agent's current location
     */
    private AgentLocation getAgentCurrentLocation(Long agentId) {
        return agentLocationRepository.findLatestByAgentId(agentId).orElse(null);
    }

    /**
     * Calculate distance using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    /**
     * Convert to DTO
     */
    private DeliveryAssignmentDTO mapToDTO(DeliveryAssignment assignment) {
        return DeliveryAssignmentDTO.builder()
                .id(assignment.getId())
                .orderId(assignment.getOrder().getId())
                .agentId(assignment.getDeliveryAgent().getId())
                .agentName(assignment.getDeliveryAgent().getFirstName() + " " +
                        assignment.getDeliveryAgent().getLastName())
                .status(assignment.getStatus().toString())
                .assignedAt(assignment.getAssignedAt())
                .acceptedAt(assignment.getAcceptedAt())
                .pickedUpAt(assignment.getPickedUpAt())
                .deliveredAt(assignment.getDeliveredAt())
                .agentRating(assignment.getAgentRating())
                .agentFeedback(assignment.getAgentFeedback())
                .build();
    }
}
