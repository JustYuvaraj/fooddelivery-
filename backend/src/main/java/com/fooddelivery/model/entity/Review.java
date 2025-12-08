package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_reviews_restaurant", columnList = "restaurant_id"),
    @Index(name = "idx_reviews_agent", columnList = "delivery_agent_id"),
    @Index(name = "idx_reviews_customer", columnList = "customer_id"),
    @Index(name = "idx_reviews_order", columnList = "order_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_agent_id")
    private User deliveryAgent;
    
    @Column(name = "food_rating")
    private Integer foodRating; // 1-5
    
    @Column(name = "delivery_rating")
    private Integer deliveryRating; // 1-5
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
}



