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
public class UpdateRestaurantRequest {
    private String name;
    private String description;
    private String cuisineType;
    private String address;
    private String phone;
    private String email;
    private String openingTime;
    private String closingTime;
    private Integer prepTimeMins;
    private BigDecimal minOrderAmount;
    private BigDecimal deliveryRadiusKm;
    private String logoUrl;
    private String bannerUrl;
    private Boolean isActive;
    private Boolean isAcceptingOrders;
}
