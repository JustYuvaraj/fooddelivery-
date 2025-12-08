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
public class ReviewDTO {
    
    private Long id;
    private Long orderId;
    private Long restaurantId;
    private String restaurantName;
    private Long deliveryAgentId;
    private String deliveryAgentName;
    private Integer foodRating;
    private Integer deliveryRating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



