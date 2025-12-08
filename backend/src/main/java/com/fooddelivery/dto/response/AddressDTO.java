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
public class AddressDTO {
    
    private Long id;
    private String label;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}



