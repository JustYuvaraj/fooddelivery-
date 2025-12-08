package com.fooddelivery.dto.response;

import com.fooddelivery.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String data;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}



