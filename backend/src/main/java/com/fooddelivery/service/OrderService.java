package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.request.OrderItemRequest;
import com.fooddelivery.dto.response.OrderDTO;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.model.entity.*;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Random;

@Slf4j
@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * Create a new order with validation and calculation
     */
    public OrderDTO createOrder(CreateOrderRequest request, Long customerId) {
        log.info("Creating order for customer: {} from restaurant: {}", customerId, request.getRestaurantId());

        // 1. Validate restaurant exists and is accepting orders
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + request.getRestaurantId()));

        if (!restaurant.getIsAcceptingOrders()) {
            throw new ResourceNotFoundException("Restaurant is not accepting orders at the moment");
        }

        // 2. Validate customer exists
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // 3. Validate and get delivery address
        UserAddress deliveryAddress = userAddressRepository.findById(request.getDeliveryAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery address not found"));

        // 4. Validate order items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // 5. Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.PLACED);
        order.setPlacedAt(LocalDateTime.now());
        order.setDeliveryLatitude(deliveryAddress.getLatitude());
        order.setDeliveryLongitude(deliveryAddress.getLongitude());
        order.setDeliveryAddress(deliveryAddress);

        // 6. Add order items and calculate totals
        BigDecimal itemsTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemRequest.getProductId()));

            if (!product.getIsAvailable()) {
                throw new ResourceNotFoundException("Product is not available: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSpecialRequests(itemRequest.getSpecialRequests());

            BigDecimal itemSubtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            orderItem.setSubtotal(itemSubtotal);

            orderItems.add(orderItem);
            itemsTotal = itemsTotal.add(itemSubtotal);
        }

        order.setItems(orderItems);
        order.setItemsTotal(itemsTotal);

        // 7. Calculate delivery fee based on distance
        BigDecimal deliveryFee = calculateDeliveryFee(restaurant, deliveryAddress);
        order.setDeliveryFee(deliveryFee);

        // 8. Calculate tax (5%)
        BigDecimal taxAmount = itemsTotal.multiply(BigDecimal.valueOf(0.05));
        order.setTaxAmount(taxAmount);

        // 9. Calculate total
        BigDecimal totalAmount = itemsTotal.add(deliveryFee).add(taxAmount);
        order.setTotalAmount(totalAmount);

        // 10. Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {} and total: {}", savedOrder.getId(), totalAmount);

        // 11. Publish event for async processing
        eventPublisher.publishEvent(new OrderPlacedEvent(savedOrder.getId(), customerId, restaurant.getId()));

        return mapToDTO(savedOrder);
    }

    /**
     * Update order status
     */
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus newStatus, Long userId) {
        log.info("Updating order {} to status: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus oldStatus = order.getStatus();

        // Update timestamps based on status
        switch (newStatus) {
            case CONFIRMED:
                order.setStatus(OrderStatus.CONFIRMED);
                order.setConfirmedAt(LocalDateTime.now());
                break;
            case PREPARING:
                order.setStatus(OrderStatus.PREPARING);
                break;
            case READY:
                order.setStatus(OrderStatus.READY);
                order.setReadyAt(LocalDateTime.now());
                break;
            case PICKED_UP:
                order.setStatus(OrderStatus.PICKED_UP);
                order.setPickedUpAt(LocalDateTime.now());
                break;
            case OUT_FOR_DELIVERY:
                order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
                break;
            case DELIVERED:
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredAt(LocalDateTime.now());
                break;
            case CANCELLED:
                order.setStatus(OrderStatus.CANCELLED);
                break;
            default:
                throw new IllegalArgumentException("Invalid order status: " + newStatus);
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated from {} to {}", orderId, oldStatus, newStatus);

        // Publish status change event
        eventPublisher.publishEvent(new OrderStatusChangedEvent(orderId, oldStatus, newStatus, userId));

        return mapToDTO(updatedOrder);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return mapToDTO(order);
    }

    /**
     * Get all orders for a customer
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> getCustomerOrders(Long customerId, Pageable pageable) {
        log.info("Fetching orders for customer: {}", customerId);
        return orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get all orders for a restaurant
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> getRestaurantOrders(Long restaurantId, OrderStatus status, Pageable pageable) {
        log.info("Fetching orders for restaurant: {} with status: {}", restaurantId, status);

        if (status != null) {
            return orderRepository.findByRestaurantIdAndStatusOrderByPlacedAtDesc(restaurantId, status, pageable)
                    .map(this::mapToDTO);
        }

        return orderRepository.findByRestaurantIdOrderByPlacedAtDesc(restaurantId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Cancel order
     */
    public OrderDTO cancelOrder(Long orderId, String cancellationReason, Long userId) {
        log.info("Cancelling order: {} with reason: {}", orderId, cancellationReason);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Only allow cancellation if order hasn't been picked up
        if (order.getStatus() == OrderStatus.PICKED_UP ||
            order.getStatus() == OrderStatus.OUT_FOR_DELIVERY ||
            order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(cancellationReason);

        Order cancelledOrder = orderRepository.save(order);
        log.info("Order {} cancelled successfully", orderId);

        // Publish cancellation event
        eventPublisher.publishEvent(new OrderCancelledEvent(orderId, userId, cancellationReason));

        return mapToDTO(cancelledOrder);
    }

    /**
     * Calculate delivery fee based on distance between restaurant and delivery address
     */
    private BigDecimal calculateDeliveryFee(Restaurant restaurant, UserAddress deliveryAddress) {
        double distance = calculateDistance(
                restaurant.getLatitude(), restaurant.getLongitude(),
                deliveryAddress.getLatitude(), deliveryAddress.getLongitude()
        );

        // Fee structure:
        // 0-2 km: ₹50
        // 2-5 km: ₹100
        // 5-10 km: ₹150
        // 10+ km: ₹200

        if (distance <= 2) {
            return BigDecimal.valueOf(50);
        } else if (distance <= 5) {
            return BigDecimal.valueOf(100);
        } else if (distance <= 10) {
            return BigDecimal.valueOf(150);
        } else {
            return BigDecimal.valueOf(200);
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
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
     * Generate unique order number
     */
    private String generateOrderNumber() {
        long timestamp = System.currentTimeMillis();
        Random random = new Random();
        int randomNum = random.nextInt(10000);
        return "ORD-" + timestamp + "-" + String.format("%04d", randomNum);
    }

    /**
     * Convert Order entity to DTO
     */
    private OrderDTO mapToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .status(order.getStatus().toString())
                .itemsTotal(order.getItemsTotal())
                .deliveryFee(order.getDeliveryFee())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .placedAt(order.getPlacedAt())
                .confirmedAt(order.getConfirmedAt())
                .readyAt(order.getReadyAt())
                .deliveredAt(order.getDeliveredAt())
                .build();
    }

    /**
     * Events for async processing
     */
    public static class OrderPlacedEvent {
        public final Long orderId;
        public final Long customerId;
        public final Long restaurantId;

        public OrderPlacedEvent(Long orderId, Long customerId, Long restaurantId) {
            this.orderId = orderId;
            this.customerId = customerId;
            this.restaurantId = restaurantId;
        }
    }

    public static class OrderStatusChangedEvent {
        public final Long orderId;
        public final OrderStatus oldStatus;
        public final OrderStatus newStatus;
        public final Long userId;

        public OrderStatusChangedEvent(Long orderId, OrderStatus oldStatus, OrderStatus newStatus, Long userId) {
            this.orderId = orderId;
            this.oldStatus = oldStatus;
            this.newStatus = newStatus;
            this.userId = userId;
        }
    }

    public static class OrderCancelledEvent {
        public final Long orderId;
        public final Long userId;
        public final String reason;

        public OrderCancelledEvent(Long orderId, Long userId, String reason) {
            this.orderId = orderId;
            this.userId = userId;
            this.reason = reason;
        }
    }
}
