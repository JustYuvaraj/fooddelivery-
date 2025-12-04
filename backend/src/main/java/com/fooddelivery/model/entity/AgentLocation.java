package com.fooddelivery.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "agent_locations", indexes = {
    @Index(name = "idx_agent_locations_agent", columnList = "agent_id"),
    @Index(name = "idx_agent_locations_time", columnList = "recorded_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentLocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long agentId;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;
    
    @Column(precision = 8, scale = 2)
    private Double accuracyMeters;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isOnline = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;
}
