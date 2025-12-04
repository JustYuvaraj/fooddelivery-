package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAssignmentDTO {
    
    private Long id;
    private Long orderId;
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private String rejectionReason;
    private Integer agentRating;
    private String agentFeedback;
}
