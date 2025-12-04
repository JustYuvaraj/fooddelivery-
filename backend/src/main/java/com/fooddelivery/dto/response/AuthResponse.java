package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    
    private String token;
    private final String type = "Bearer";
    private Long userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String message;
}
