package com.fooddelivery.modules.delivery.application;

import com.fooddelivery.modules.delivery.domain.dto.DeliveryAssignmentDTO;
import com.fooddelivery.modules.delivery.infra.DeliveryAssignmentRepository;
import com.fooddelivery.model.entity.DeliveryAssignment;
import com.fooddelivery.model.entity.Order;
import com.fooddelivery.model.enums.AssignmentStatus;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.modules.order.infra.OrderRepository;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedAccessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepository orderRepository;

    /**
     * Get delivery agent's assigned orders
     */
    @Transactional(readOnly = true)
    public Page<DeliveryAssignmentDTO> getAgentOrders(Long agentId, Pageable pageable) {
        log.info("Fetching orders for delivery agent: {}", agentId);
        return deliveryAssignmentRepository.findByDeliveryAgentIdOrderByAssignedAtDesc(agentId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Accept delivery assignment
     */
    public DeliveryAssignmentDTO acceptAssignment(Long assignmentId, Long agentId) {
        log.info("Accepting delivery assignment: {} by agent: {}", assignmentId, agentId);

        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Verify agent owns this assignment
        if (!assignment.getDeliveryAgent().getId().equals(agentId)) {
            throw new UnauthorizedAccessException("You cannot accept this assignment");
        }

        // Verify assignment is still pending
        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new IllegalStateException("Assignment is not in PENDING status");
        }

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());

        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.ASSIGNED);
        order.setDeliveryAgent(assignment.getDeliveryAgent());
        orderRepository.save(order);

        DeliveryAssignment updated = deliveryAssignmentRepository.save(assignment);
        log.info("Assignment {} accepted by agent {}", assignmentId, agentId);

        return mapToDTO(updated);
    }

    /**
     * Reject delivery assignment
     */
    public void rejectAssignment(Long assignmentId, Long agentId) {
        log.info("Rejecting delivery assignment: {} by agent: {}", assignmentId, agentId);

        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getDeliveryAgent().getId().equals(agentId)) {
            throw new UnauthorizedAccessException("You cannot reject this assignment");
        }

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new IllegalStateException("Assignment is not in PENDING status");
        }

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRejectedAt(LocalDateTime.now());
        deliveryAssignmentRepository.save(assignment);

        log.info("Assignment {} rejected by agent {}", assignmentId, agentId);
    }

    /**
     * Update agent location
     */
    public void updateAgentLocation(Long agentId, Double latitude, Double longitude) {
        log.info("Updating location for delivery agent: {} at ({}, {})", agentId, latitude, longitude);
        // Location tracking service removed - implement if needed
    }

    /**
     * Mark order as picked up
     */
    public void markOrderAsPickedUp(Long orderId, Long agentId) {
        log.info("Marking order {} as picked up by agent {}", orderId, agentId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getDeliveryAgent() == null || !order.getDeliveryAgent().getId().equals(agentId)) {
            throw new UnauthorizedAccessException("You are not assigned to this order");
        }

        if (order.getStatus() != OrderStatus.READY) {
            throw new IllegalStateException("Order is not ready for pickup");
        }

        order.setStatus(OrderStatus.PICKED_UP);
        order.setPickedUpAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Order {} marked as picked up", orderId);
    }

    /**
     * Mark order as delivered
     */
    public void markOrderAsDelivered(Long orderId, Long agentId) {
        log.info("Marking order {} as delivered by agent {}", orderId, agentId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getDeliveryAgent() == null || !order.getDeliveryAgent().getId().equals(agentId)) {
            throw new UnauthorizedAccessException("You are not assigned to this order");
        }

        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY && order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalStateException("Order is not in delivery status");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Order {} marked as delivered", orderId);
    }

    /**
     * Get delivery assignment details
     */
    @Transactional(readOnly = true)
    public DeliveryAssignmentDTO getAssignmentDetails(Long assignmentId) {
        log.info("Fetching delivery assignment details: {}", assignmentId);
        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        return mapToDTO(assignment);
    }

    /**
     * Convert DeliveryAssignment entity to DTO
     */
    private DeliveryAssignmentDTO mapToDTO(DeliveryAssignment assignment) {
        return DeliveryAssignmentDTO.builder()
                .id(assignment.getId())
                .orderId(assignment.getOrder().getId())
                .orderNumber(assignment.getOrder().getOrderNumber())
                .agentId(assignment.getDeliveryAgent().getId())
                .agentName(assignment.getDeliveryAgent().getFirstName() + " " + assignment.getDeliveryAgent().getLastName())
                .status(assignment.getStatus().toString())
                .assignedAt(assignment.getAssignedAt())
                .acceptedAt(assignment.getAcceptedAt())
                .rejectedAt(assignment.getRejectedAt())
                .build();
    }
}
