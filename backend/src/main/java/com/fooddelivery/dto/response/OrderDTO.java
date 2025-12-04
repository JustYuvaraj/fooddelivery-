package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long restaurantId;
    private String restaurantName;
    private Long deliveryAgentId;
    private String deliveryAgentName;
    
    private String status;
    private List<OrderItemDTO> items;
    
    private BigDecimal itemsTotal;
    private BigDecimal deliveryFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    
    private LocalDateTime placedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime readyAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedDeliveryTime;
    
    private String specialInstructions;
}
