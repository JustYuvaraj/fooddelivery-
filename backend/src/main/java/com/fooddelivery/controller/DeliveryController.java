package com.fooddelivery.controller;

import com.fooddelivery.dto.request.UpdateLocationRequest;
import com.fooddelivery.dto.response.DeliveryAssignmentDTO;
import com.fooddelivery.model.enums.AssignmentStatus;
import com.fooddelivery.service.DeliveryAssignmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/v1/delivery")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DeliveryController {

    @Autowired
    private DeliveryAssignmentService deliveryAssignmentService;

    /**
     * Get active delivery assignments for agent
     * GET /api/v1/delivery/assignments
     */
    @GetMapping("/assignments")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Page<DeliveryAssignmentDTO>> getActiveAssignments(
            @RequestParam(required = false) AssignmentStatus status,
            @PageableDefault(size = 10, sort = "assignedAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Fetching assignments for delivery agent with status: {}", status);

        Long agentId = extractUserIdFromAuth(authentication);
        Page<DeliveryAssignmentDTO> assignments;

        if (status != null) {
            assignments = deliveryAssignmentService.getAgentAssignmentsByStatus(agentId, status, pageable);
        } else {
            assignments = deliveryAssignmentService.getAgentAssignments(agentId, pageable);
        }

        return ResponseEntity.ok(assignments);
    }

    /**
     * Accept delivery assignment
     * POST /api/v1/delivery/assignments/{id}/accept
     */
    @PostMapping("/assignments/{assignmentId}/accept")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAssignmentDTO> acceptDelivery(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        log.info("Agent accepting delivery assignment: {}", assignmentId);

        Long agentId = extractUserIdFromAuth(authentication);
        DeliveryAssignmentDTO assignment = deliveryAssignmentService.acceptDelivery(assignmentId, agentId);

        return ResponseEntity.ok(assignment);
    }

    /**
     * Reject delivery assignment
     * POST /api/v1/delivery/assignments/{id}/reject
     */
    @PostMapping("/assignments/{assignmentId}/reject")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAssignmentDTO> rejectDelivery(
            @PathVariable Long assignmentId,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        log.info("Agent rejecting delivery assignment: {} with reason: {}", assignmentId, reason);

        Long agentId = extractUserIdFromAuth(authentication);
        DeliveryAssignmentDTO assignment = deliveryAssignmentService.rejectDelivery(assignmentId, agentId, reason);

        return ResponseEntity.ok(assignment);
    }

    /**
     * Mark order as picked up
     * PUT /api/v1/delivery/orders/{id}/picked-up
     */
    @PutMapping("/orders/{orderId}/picked-up")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAssignmentDTO> markAsPickedUp(
            @PathVariable Long orderId,
            Authentication authentication) {
        log.info("Marking order as picked up: {}", orderId);

        Long agentId = extractUserIdFromAuth(authentication);
        DeliveryAssignmentDTO assignment = deliveryAssignmentService.markAsPickedUp(orderId, agentId);

        return ResponseEntity.ok(assignment);
    }

    /**
     * Mark order as delivered
     * PUT /api/v1/delivery/orders/{id}/delivered
     */
    @PutMapping("/orders/{orderId}/delivered")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAssignmentDTO> markAsDelivered(
            @PathVariable Long orderId,
            Authentication authentication) {
        log.info("Marking order as delivered: {}", orderId);

        Long agentId = extractUserIdFromAuth(authentication);
        DeliveryAssignmentDTO assignment = deliveryAssignmentService.markAsDelivered(orderId, agentId);

        return ResponseEntity.ok(assignment);
    }

    /**
     * Update agent location
     * PUT /api/v1/delivery/location
     */
    @PutMapping("/location")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Void> updateLocation(
            @Valid @RequestBody UpdateLocationRequest request,
            Authentication authentication) {
        log.info("Updating delivery agent location to: ({}, {})", request.getLatitude(), request.getLongitude());

        Long agentId = extractUserIdFromAuth(authentication);
        deliveryAssignmentService.updateAgentLocation(agentId, request.getLatitude(), request.getLongitude());

        return ResponseEntity.ok().build();
    }

    /**
     * Extract user ID from authentication token
     */
    private Long extractUserIdFromAuth(Authentication authentication) {
        // In production, extract from JWT token claims
        // For now, use name as placeholder
        return 1L; // Replace with actual implementation
    }
}
