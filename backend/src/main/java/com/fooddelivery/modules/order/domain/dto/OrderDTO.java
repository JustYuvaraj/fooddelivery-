package com.fooddelivery.modules.order.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long restaurantId;
    private String restaurantName;
    private String status;
    private BigDecimal itemsTotal;
    private BigDecimal deliveryFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private LocalDateTime placedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime readyAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime pickedUpAt;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private LocalDateTime estimatedDeliveryTime;
    private String specialInstructions;
    private Long deliveryAgentId;
    private String deliveryAgentName;
    private List<OrderItemDTO> items;
}
