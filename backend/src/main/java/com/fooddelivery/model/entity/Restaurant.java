package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "restaurants", indexes = {
    @Index(name = "idx_restaurants_owner", columnList = "owner_id"),
    @Index(name = "idx_restaurants_active", columnList = "is_active, is_accepting_orders")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String cuisineType;
    
    @Column(nullable = false, length = 500)
    private String address;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(length = 255)
    private String email;
    
    @Column(nullable = false)
    private LocalTime openingTime;
    
    @Column(nullable = false)
    private LocalTime closingTime;
    
    @Column
    @Builder.Default
    private Integer prepTimeMinutes = 30;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private Double minOrderAmount = 0.0;
    
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private Double deliveryRadiusKm = 5.0;
    
    @Column(precision = 3, scale = 2)
    @Builder.Default
    private Double rating = 0.0;
    
    @Column
    @Builder.Default
    private Integer totalReviews = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isAcceptingOrders = true;
    
    @Column(length = 500)
    private String logoUrl;
    
    @Column(length = 500)
    private String bannerUrl;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
