package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fooddelivery.model.enums.OrderStatus;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_customer", columnList = "customer_id, status"),
    @Index(name = "idx_orders_restaurant", columnList = "restaurant_id, status"),
    @Index(name = "idx_orders_delivery", columnList = "delivery_agent_id, status"),
    @Index(name = "idx_orders_status", columnList = "status"),
    @Index(name = "idx_orders_date", columnList = "placed_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String orderNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_agent_id")
    private User deliveryAgent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_address_id")
    private UserAddress deliveryAddress;
    
    @Column(nullable = false)
    private Double deliveryLatitude;
    
    @Column(nullable = false)
    private Double deliveryLongitude;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private OrderStatus status = OrderStatus.PLACED;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal itemsTotal;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime placedAt;
    
    @Column
    private LocalDateTime confirmedAt;
    
    @Column
    private LocalDateTime readyAt;
    
    @Column
    private LocalDateTime pickedUpAt;
    
    @Column
    private LocalDateTime deliveredAt;
    
    @Column
    private LocalDateTime cancelledAt;
    
    @Column(columnDefinition = "TEXT")
    private String specialInstructions;
    
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;
    
    @Column
    private LocalDateTime estimatedDeliveryTime;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (this.placedAt == null) {
            this.placedAt = LocalDateTime.now();
        }
    }
}
