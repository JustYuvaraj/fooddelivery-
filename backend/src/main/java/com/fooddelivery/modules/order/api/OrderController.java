package com.fooddelivery.modules.order.api;

import com.fooddelivery.modules.order.application.OrderService;
import com.fooddelivery.modules.order.domain.dto.OrderDTO;
import com.fooddelivery.modules.order.domain.dto.CreateOrderRequest;
import com.fooddelivery.model.enums.OrderStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Create a new order
     * POST /api/v1/orders
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        log.info("Creating order for customer");
        Long customerId = extractUserIdFromAuth(authentication);
        OrderDTO order = orderService.createOrder(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Get order by ID
     * GET /api/v1/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        log.info("Fetching order: {}", orderId);
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    /**
     * Get customer orders
     * GET /api/v1/orders/customer/my-orders
     */
    @GetMapping("/customer/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderDTO>> getCustomerOrders(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "placedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching customer orders");
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId, pageable));
    }

    /**
     * Get filtered customer orders
     * GET /api/v1/orders/customer/filtered
     */
    @GetMapping("/customer/filtered")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderDTO>> getFilteredOrders(
            Authentication authentication,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @PageableDefault(size = 10, sort = "placedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching filtered orders");
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.getCustomerOrdersFiltered(customerId, status, fromDate, toDate, pageable));
    }

    /**
     * Update order status
     * PATCH /api/v1/orders/{orderId}/status
     */
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            Authentication authentication) {
        log.info("Updating order {} status to {}", orderId, status);
        Long userId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status, userId));
    }

    /**
     * Cancel order
     * POST /api/v1/orders/{orderId}/cancel
     */
    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "Customer requested cancellation") String reason,
            Authentication authentication) {
        log.info("Cancelling order: {}", orderId);
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.cancelOrder(orderId, reason, customerId));
    }

    /**
     * Reorder from previous order
     * POST /api/v1/orders/{orderId}/reorder
     */
    @PostMapping("/{orderId}/reorder")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> reorder(
            @PathVariable Long orderId,
            @RequestParam(required = false) Long addressId,
            Authentication authentication) {
        log.info("Reordering from order: {}", orderId);
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.reorder(orderId, customerId, addressId));
    }

    /**
     * Get restaurant orders
     * GET /api/v1/orders/restaurant/my-orders
     */
    @GetMapping("/restaurant/my-orders")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Page<OrderDTO>> getRestaurantOrders(
            Authentication authentication,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 10, sort = "placedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching restaurant orders");
        Long restaurantId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId, status, pageable));
    }

    /**
     * Get delivery agent orders
     * GET /api/v1/orders/delivery/my-orders
     */
    @GetMapping("/delivery/my-orders")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Page<OrderDTO>> getDeliveryAgentOrders(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "placedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching delivery agent orders");
        Long agentId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.getDeliveryAgentOrders(agentId, pageable));
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
