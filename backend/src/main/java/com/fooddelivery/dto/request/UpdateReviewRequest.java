package com.fooddelivery.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewRequest {
    
    @Min(value = 1, message = "Food rating must be between 1 and 5")
    @Max(value = 5, message = "Food rating must be between 1 and 5")
    private Integer foodRating;
    
    @Min(value = 1, message = "Delivery rating must be between 1 and 5")
    @Max(value = 5, message = "Delivery rating must be between 1 and 5")
    private Integer deliveryRating;
    
    private String comment;
}



