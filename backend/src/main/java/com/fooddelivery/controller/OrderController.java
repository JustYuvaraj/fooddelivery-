package com.fooddelivery.controller;

import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.response.OrderDTO;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.service.OrderService;
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
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Create a new order
     * POST /api/v1/customer/orders
     */
    @PostMapping("/customer/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        log.info("Creating order for customer: {}", authentication.getName());

        Long customerId = extractUserIdFromAuth(authentication);
        OrderDTO order = orderService.createOrder(request, customerId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(order);
    }

    /**
     * Get all orders for customer
     * GET /api/v1/customer/orders
     */
    @GetMapping("/customer/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderDTO>> getCustomerOrders(
            @PageableDefault(size = 10, sort = "placedAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Fetching orders for customer: {}", authentication.getName());

        Long customerId = extractUserIdFromAuth(authentication);
        Page<OrderDTO> orders = orderService.getCustomerOrders(customerId, pageable);

        return ResponseEntity.ok(orders);
    }

    /**
     * Get single order by ID
     * GET /api/v1/customer/orders/{id}
     */
    @GetMapping("/customer/orders/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long orderId) {
        log.info("Fetching order: {}", orderId);

        OrderDTO order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancel order
     * PUT /api/v1/customer/orders/{id}/cancel
     */
    @PutMapping("/customer/orders/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam String reason,
            Authentication authentication) {
        log.info("Cancelling order: {} with reason: {}", orderId, reason);

        Long customerId = extractUserIdFromAuth(authentication);
        OrderDTO order = orderService.cancelOrder(orderId, reason, customerId);

        return ResponseEntity.ok(order);
    }

    /**
     * Get all orders for restaurant
     * GET /api/v1/restaurant/orders
     */
    @GetMapping("/restaurant/orders")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Page<OrderDTO>> getRestaurantOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 10, sort = "placedAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Fetching restaurant orders with status: {}", status);

        Long restaurantId = extractUserIdFromAuth(authentication);
        Page<OrderDTO> orders = orderService.getRestaurantOrders(restaurantId, status, pageable);

        return ResponseEntity.ok(orders);
    }

    /**
     * Update order status (by restaurant)
     * PUT /api/v1/restaurant/orders/{id}/status
     */
    @PutMapping("/restaurant/orders/{orderId}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            Authentication authentication) {
        log.info("Updating order {} status to: {}", orderId, status);

        Long userId = extractUserIdFromAuth(authentication);
        OrderDTO order = orderService.updateOrderStatus(orderId, status, userId);

        return ResponseEntity.ok(order);
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
