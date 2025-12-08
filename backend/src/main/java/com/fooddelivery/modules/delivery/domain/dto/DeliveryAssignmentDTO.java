package com.fooddelivery.modules.delivery.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignmentDTO {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long agentId;
    private String agentName;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
}
