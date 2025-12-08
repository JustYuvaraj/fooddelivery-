package com.fooddelivery.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    
    private String name;
    
    private String description;
    
    private String category;
    
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    private String imageUrl;
    
    private Boolean isVeg;
    
    private Boolean isAvailable;
    
    private Integer prepTimeMins;
}



