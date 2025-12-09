package com.fooddelivery.modules.order.application;

import com.fooddelivery.modules.order.domain.dto.CreateOrderRequest;
import com.fooddelivery.modules.order.domain.dto.OrderDTO;
import com.fooddelivery.modules.order.domain.dto.OrderItemRequest;
import com.fooddelivery.modules.order.domain.dto.OrderItemDTO;
import com.fooddelivery.modules.order.domain.event.OrderCancelledEvent;
import com.fooddelivery.modules.order.domain.event.OrderPlacedEvent;
import com.fooddelivery.modules.order.domain.event.OrderStatusChangedEvent;
import com.fooddelivery.modules.order.infra.OrderRepository;
import com.fooddelivery.model.entity.*;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.repository.ProductRepository;
import com.fooddelivery.repository.UserAddressRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.modules.restaurant.infra.RestaurantRepository;
import com.fooddelivery.util.GeoUtils;
import com.fooddelivery.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final ApplicationEventPublisher eventPublisher;

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
     * Get all orders for a delivery agent
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> getDeliveryAgentOrders(Long agentId, Pageable pageable) {
        log.info("Fetching orders for delivery agent: {}", agentId);
        return orderRepository.findByDeliveryAgentIdOrderByPlacedAtDesc(agentId, pageable)
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
     * Get customer orders with filtering
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> getCustomerOrdersFiltered(Long customerId, OrderStatus status, 
                                                      String fromDate, String toDate, Pageable pageable) {
        log.info("Fetching filtered orders for customer: {} with status: {}", customerId, status);
        
        Page<Order> orders = orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, pageable);
        
        // Apply filters
        List<Order> filtered = orders.getContent().stream()
                .filter(order -> status == null || order.getStatus() == status)
                .filter(order -> {
                    if (fromDate != null && !fromDate.isEmpty()) {
                        LocalDateTime from = LocalDateTime.parse(fromDate);
                        if (order.getPlacedAt().isBefore(from)) return false;
                    }
                    if (toDate != null && !toDate.isEmpty()) {
                        LocalDateTime to = LocalDateTime.parse(toDate);
                        if (order.getPlacedAt().isAfter(to)) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        List<OrderDTO> filteredDtos = filtered.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(filteredDtos, pageable, filteredDtos.size());
    }

    /**
     * Reorder from a previous order
     */
    public OrderDTO reorder(Long previousOrderId, Long customerId, Long addressId) {
        log.info("Reordering order: {} for customer: {}", previousOrderId, customerId);
        
        Order previousOrder = orderRepository.findById(previousOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Previous order not found"));
        
        // Verify ownership
        if (!previousOrder.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Order not found");
        }
        
        // Determine delivery address
        Long deliveryAddressId = addressId != null ? addressId : previousOrder.getDeliveryAddress().getId();
        
        // Create new order request from previous order
        CreateOrderRequest request = new CreateOrderRequest();
        request.setRestaurantId(previousOrder.getRestaurant().getId());
        request.setDeliveryAddressId(deliveryAddressId);
        request.setSpecialInstructions("Reorder from order #" + previousOrder.getOrderNumber());
        
        // Convert order items to request items
        List<OrderItemRequest> items = previousOrder.getItems().stream()
                .map(item -> {
                    OrderItemRequest itemRequest = new OrderItemRequest();
                    itemRequest.setProductId(item.getProduct().getId());
                    itemRequest.setQuantity(item.getQuantity());
                    itemRequest.setSpecialRequests(item.getSpecialRequests());
                    return itemRequest;
                })
                .collect(Collectors.toList());
        
        request.setItems(items);
        
        // Create new order
        return createOrder(request, customerId);
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
        return GeoUtils.haversineDistance(lat1, lon1, lat2, lon2);
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
        OrderDTO.OrderDTOBuilder builder = OrderDTO.builder()
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
                .deliveryLatitude(order.getDeliveryLatitude())
                .deliveryLongitude(order.getDeliveryLongitude())
                .pickedUpAt(order.getPickedUpAt())
                .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                .specialInstructions(order.getSpecialInstructions());
        
        // Add delivery agent information if present
        if (order.getDeliveryAgent() != null) {
            builder.deliveryAgentId(order.getDeliveryAgent().getId());
            builder.deliveryAgentName(order.getDeliveryAgent().getFirstName() + " " + order.getDeliveryAgent().getLastName());
        }
        
        // Map order items to DTOs
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            builder.items(order.getItems().stream()
                    .map(this::mapOrderItemToDTO)
                    .collect(Collectors.toList()));
        }
        
        return builder.build();
    }

    /**
     * Convert OrderItem entity to DTO
     */
    private OrderItemDTO mapOrderItemToDTO(OrderItem orderItem) {
        return OrderItemDTO.builder()
                .id(orderItem.getId())
                .orderId(orderItem.getOrder().getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProductName())
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .subtotal(orderItem.getSubtotal())
                .specialRequests(orderItem.getSpecialRequests())
                .build();
    }
}
