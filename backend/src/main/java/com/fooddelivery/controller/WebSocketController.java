package com.fooddelivery.controller;

import com.fooddelivery.dto.response.OrderDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket Controller for real-time order tracking and notifications
 * 
 * Endpoints:
 * - /app/orders/{orderId}/track: Customer subscribes to order updates
 * - /app/orders/{orderId}/status: Update order status in real-time
 * - /app/delivery/{agentId}/location: Agent broadcasts current location
 * - /app/restaurant/{restaurantId}/orders: Restaurant receives new orders
 */
@Slf4j
@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Order status update - broadcast to customer
     * 
     * Client sends: /app/orders/{orderId}/status
     * Server broadcasts to: /topic/orders/{orderId}/status
     */
    @MessageMapping("/orders/{orderId}/status")
    @SendTo("/topic/orders/{orderId}/status")
    public OrderStatusUpdate updateOrderStatus(
            @Payload OrderStatusUpdate update) {
        log.info("Order {} status changed to: {}", update.getOrderId(), update.getStatus());
        
        // Add server timestamp
        update.setTimestamp(LocalDateTime.now());
        
        // Optional: Persist to database (already handled by REST API)
        return update;
    }

    /**
     * Subscribe to order updates
     * Client subscribes: SUBSCRIBE /user/queue/order-{orderId}
     * Server sends: ORDER_UPDATED, ORDER_PICKED_UP, ORDER_DELIVERED
     */
    @SubscribeMapping("/order-{orderId}")
    public OrderStatusUpdate subscribeToOrder(String orderId) {
        log.info("Customer subscribed to order: {}", orderId);
        
        return OrderStatusUpdate.builder()
                .orderId(Long.parseLong(orderId))
                .status("SUBSCRIBED")
                .message("Tracking order #" + orderId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Delivery agent broadcasts current location
     * 
     * Client sends: /app/delivery/{agentId}/location
     * Server broadcasts to: /topic/delivery/{orderId}/location
     */
    @MessageMapping("/delivery/{agentId}/location")
    public void updateDeliveryLocation(
            @Payload DeliveryLocationUpdate locationUpdate,
            String agentId) {
        log.debug("Agent {} location: {}, {}", agentId, 
                locationUpdate.getLatitude(), locationUpdate.getLongitude());
        
        // Broadcast to all customers tracking this delivery
        String destination = "/topic/delivery/" + locationUpdate.getOrderId() + "/location";
        messagingTemplate.convertAndSend(destination, locationUpdate);
    }

    /**
     * Subscribe to live delivery tracking
     * Client subscribes: SUBSCRIBE /topic/delivery/{orderId}/location
     * Server sends live location updates as agent moves
     */
    @SubscribeMapping("/delivery/{orderId}/location")
    public DeliveryLocationUpdate subscribeToDeliveryTracking(String orderId) {
        log.info("Customer subscribed to delivery tracking for order: {}", orderId);
        
        return DeliveryLocationUpdate.builder()
                .orderId(Long.parseLong(orderId))
                .agentName("Tracking Agent")
                .status("TRACKING_ACTIVE")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * New order notification to restaurant
     * 
     * Called by OrderService after order creation
     * Restaurant receives: /user/restaurant-{restaurantId}/queue/new-order
     */
    public void notifyRestaurantNewOrder(Long restaurantId, OrderDTO order) {
        log.info("Notifying restaurant {} of new order {}", restaurantId, order.getId());
        
        String destination = "/user/restaurant-" + restaurantId + "/queue/new-order";
        messagingTemplate.convertAndSend(destination, order);
    }

    /**
     * Delivery agent acceptance notification to customer
     * 
     * Called by DeliveryAssignmentService after acceptance
     * Customer receives: /user/customer-{customerId}/queue/delivery-assigned
     */
    public void notifyCustomerDeliveryAssignment(Long customerId, Long agentId, String agentName) {
        log.info("Notifying customer {} that agent {} accepted delivery", customerId, agentName);
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "DELIVERY_ASSIGNED");
        notification.put("agentId", agentId);
        notification.put("agentName", agentName);
        notification.put("timestamp", LocalDateTime.now());
        notification.put("message", agentName + " is on the way!");
        
        String destination = "/user/customer-" + customerId + "/queue/delivery-assigned";
        messagingTemplate.convertAndSend(destination, notification);
    }

    /**
     * Delivery picked up notification
     */
    public void notifyOrderPickedUp(Long customerId, Long orderId) {
        log.info("Notifying customer {} order {} picked up", customerId, orderId);
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "PICKED_UP");
        notification.put("orderId", orderId);
        notification.put("message", "Your order is on the way!");
        notification.put("timestamp", LocalDateTime.now());
        
        String destination = "/user/customer-" + customerId + "/queue/order-picked-up";
        messagingTemplate.convertAndSend(destination, notification);
    }

    /**
     * Order delivered notification
     */
    public void notifyOrderDelivered(Long customerId, Long orderId) {
        log.info("Notifying customer {} order {} delivered", customerId, orderId);
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "DELIVERED");
        notification.put("orderId", orderId);
        notification.put("message", "Your order has been delivered!");
        notification.put("timestamp", LocalDateTime.now());
        
        String destination = "/user/customer-" + customerId + "/queue/order-delivered";
        messagingTemplate.convertAndSend(destination, notification);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class OrderStatusUpdate {
        private Long orderId;
        private String orderNumber;
        private String status; // PLACED, ACCEPTED, READY, PICKED_UP, DELIVERED
        private String message;
        private LocalDateTime timestamp;
        private String restaurantName;
        private String agentName;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class DeliveryLocationUpdate {
        private Long orderId;
        private Long agentId;
        private String agentName;
        private Double latitude;
        private Double longitude;
        private Float accuracy;
        private String status; // TRACKING_ACTIVE, ARRIVED, DELIVERED
        private Integer estimatedMinutes;
        private LocalDateTime timestamp;
    }
}
