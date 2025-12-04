package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_addresses", indexes = {
    @Index(name = "idx_addresses_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 50)
    private String label; // 'Home', 'Work', 'Other'
    
    @Column(nullable = false, length = 255)
    private String addressLine1;
    
    @Column(length = 255)
    private String addressLine2;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(nullable = false, length = 100)
    private String state;
    
    @Column(nullable = false, length = 20)
    private String postalCode;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
