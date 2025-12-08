package com.fooddelivery.modules.restaurant.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private String imageUrl;
    private Boolean isVeg;
    private Boolean isAvailable;
    private Integer prepTimeMins;
}
