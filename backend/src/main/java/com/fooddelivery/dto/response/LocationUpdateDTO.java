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
public class LocationUpdateDTO {
    
    private Long agentId;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private LocalDateTime recordedAt;
}
