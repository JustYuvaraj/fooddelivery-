package com.fooddelivery.modules.order.domain.event;

import com.fooddelivery.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangedEvent {
    private Long orderId;
    private OrderStatus oldStatus;
    private OrderStatus newStatus;
    private Long userId;
}
