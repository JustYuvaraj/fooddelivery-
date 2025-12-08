package com.fooddelivery.modules.delivery.api;

import com.fooddelivery.modules.delivery.application.DeliveryService;
import com.fooddelivery.modules.delivery.domain.dto.DeliveryAssignmentDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/delivery")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    /**
     * Get delivery agent's assigned orders
     * GET /api/v1/delivery/my-orders
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Page<DeliveryAssignmentDTO>> getMyOrders(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "assignedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching delivery orders for agent");
        Long agentId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(deliveryService.getAgentOrders(agentId, pageable));
    }

    /**
     * Accept delivery assignment
     * POST /api/v1/delivery/assignments/{assignmentId}/accept
     */
    @PostMapping("/assignments/{assignmentId}/accept")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAssignmentDTO> acceptAssignment(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        log.info("Accepting delivery assignment: {}", assignmentId);
        Long agentId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(deliveryService.acceptAssignment(assignmentId, agentId));
    }

    /**
     * Reject delivery assignment
     * POST /api/v1/delivery/assignments/{assignmentId}/reject
     */
    @PostMapping("/assignments/{assignmentId}/reject")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Void> rejectAssignment(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        log.info("Rejecting delivery assignment: {}", assignmentId);
        Long agentId = extractUserIdFromAuth(authentication);
        deliveryService.rejectAssignment(assignmentId, agentId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update agent location
     * POST /api/v1/delivery/location
     */
    @PostMapping("/location")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Void> updateLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            Authentication authentication) {
        log.info("Updating delivery agent location: ({}, {})", latitude, longitude);
        Long agentId = extractUserIdFromAuth(authentication);
        deliveryService.updateAgentLocation(agentId, latitude, longitude);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark order as picked up
     * POST /api/v1/delivery/orders/{orderId}/picked-up
     */
    @PostMapping("/orders/{orderId}/picked-up")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Void> markAsPickedUp(
            @PathVariable Long orderId,
            Authentication authentication) {
        log.info("Marking order {} as picked up", orderId);
        Long agentId = extractUserIdFromAuth(authentication);
        deliveryService.markOrderAsPickedUp(orderId, agentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark order as delivered
     * POST /api/v1/delivery/orders/{orderId}/delivered
     */
    @PostMapping("/orders/{orderId}/delivered")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Void> markAsDelivered(
            @PathVariable Long orderId,
            Authentication authentication) {
        log.info("Marking order {} as delivered", orderId);
        Long agentId = extractUserIdFromAuth(authentication);
        deliveryService.markOrderAsDelivered(orderId, agentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get delivery assignment details
     * GET /api/v1/delivery/assignments/{assignmentId}
     */
    @GetMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'RESTAURANT_OWNER', 'CUSTOMER')")
    public ResponseEntity<DeliveryAssignmentDTO> getAssignmentDetails(@PathVariable Long assignmentId) {
        log.info("Fetching delivery assignment: {}", assignmentId);
        return ResponseEntity.ok(deliveryService.getAssignmentDetails(assignmentId));
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.fooddelivery.security.CustomUserDetails) {
            com.fooddelivery.security.CustomUserDetails userDetails =
                (com.fooddelivery.security.CustomUserDetails) authentication.getPrincipal();
            return userDetails.getId();
        }
        throw new IllegalStateException("Unable to extract user ID from authentication");
    }
}
