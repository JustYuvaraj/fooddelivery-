package com.fooddelivery.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRestaurantRequest {
    
    private String name;
    
    private String description;
    
    private String cuisineType;
    
    private String address;
    
    private String phone;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$", message = "Invalid time format (HH:mm:ss)")
    private String openingTime;
    
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$", message = "Invalid time format (HH:mm:ss)")
    private String closingTime;
    
    private Integer prepTimeMins;
    
    @DecimalMin(value = "0.0", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;
    
    @DecimalMin(value = "0.0", message = "Delivery radius cannot be negative")
    private BigDecimal deliveryRadiusKm;
    
    private String logoUrl;
    
    private String bannerUrl;
    
    private Boolean isActive;
    
    private Boolean isAcceptingOrders;
}

