package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced delivery details with GPS coordinates for Google Maps navigation
 * Address text is supplementary - GPS coordinates are primary for navigation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryDetailsDTO {
    
    // Assignment Info
    private Long assignmentId;
    private Long orderId;
    private String orderNumber;
    private String status;
    
    // Restaurant Location (Pickup) - GPS coordinates for navigation
    private RestaurantLocationDTO restaurant;
    
    // Customer Location (Delivery) - GPS coordinates for navigation (PRIMARY)
    private CustomerLocationDTO customer;
    
    // Route Information
    private RouteInfoDTO route;
    
    // Order Details
    private List<OrderItemDTO> items;
    private BigDecimal totalAmount;
    private String specialInstructions;
    
    // Timestamps
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime estimatedPickupTime;
    private LocalDateTime estimatedDeliveryTime;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RestaurantLocationDTO {
        private Long id;
        private String name;
        private String phone;
        
        // GPS Coordinates - PRIMARY FOR NAVIGATION
        private Double latitude;
        private Double longitude;
        
        // Address - Supplementary reference only
        private String address;
        
        // Google Maps Link
        private String googleMapsLink;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerLocationDTO {
        private Long id;
        private String name;
        private String phone;
        
        // GPS Coordinates - PRIMARY FOR NAVIGATION
        private Double latitude;
        private Double longitude;
        
        // Address - Supplementary reference only
        private String address;
        
        // Google Maps Link
        private String googleMapsLink;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RouteInfoDTO {
        private Double distanceKm;
        private Integer estimatedTimeMinutes;
        private String directions;
    }
}



