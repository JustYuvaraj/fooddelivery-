package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_restaurants", indexes = {
    @Index(name = "idx_favorites_user", columnList = "user_id"),
    @Index(name = "idx_favorites_restaurant", columnList = "restaurant_id"),
    @Index(name = "idx_favorites_unique", columnList = "user_id, restaurant_id", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteRestaurant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}



