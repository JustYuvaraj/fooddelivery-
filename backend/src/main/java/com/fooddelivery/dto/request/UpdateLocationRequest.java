package com.fooddelivery.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLocationRequest {
    
    @NotNull(message = "Latitude cannot be null")
    private Double latitude;
    
    @NotNull(message = "Longitude cannot be null")
    private Double longitude;
    
    @DecimalMin(value = "0", message = "Accuracy must be non-negative")
    private Double accuracy;
}
