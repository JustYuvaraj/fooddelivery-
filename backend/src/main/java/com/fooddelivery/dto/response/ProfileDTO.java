package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDTO {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profileImageUrl;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Statistics
    private Long totalOrders;
    private Long totalCompletedOrders;
}



