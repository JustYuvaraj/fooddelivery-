package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fooddelivery.model.enums.UserRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_role", columnList = "role"),
    @Index(name = "idx_users_phone", columnList = "phone")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 255)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;
    
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(length = 100)
    private String lastName;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(length = 500)
    private String profileImageUrl;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Average rating (calculated from reviews)
    @Column
    @Builder.Default
    private Double averageRating = 0.0;
    
    // Total number of completed deliveries (for agents)
    @Column
    @Builder.Default
    private Integer totalDeliveries = 0;
    
    // Online status (for delivery agents)
    @Column
    @Builder.Default
    private Boolean isOnline = false;
}
