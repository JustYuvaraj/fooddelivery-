package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fooddelivery.model.enums.AssignmentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments", indexes = {
    @Index(name = "idx_assignments_order", columnList = "order_id"),
    @Index(name = "idx_assignments_agent", columnList = "delivery_agent_id, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_agent_id", nullable = false)
    private User deliveryAgent;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.PENDING;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime assignedAt;
    
    @Column
    private LocalDateTime acceptedAt;
    
    @Column
    private LocalDateTime rejectedAt;
    
    @Column
    private LocalDateTime pickedUpAt;
    
    @Column
    private LocalDateTime deliveredAt;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column
    private Integer agentRating;
    
    @Column(columnDefinition = "TEXT")
    private String agentFeedback;
}
