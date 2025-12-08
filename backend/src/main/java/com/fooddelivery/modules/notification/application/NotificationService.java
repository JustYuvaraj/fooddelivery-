package com.fooddelivery.modules.notification.application;

import com.fooddelivery.modules.notification.domain.dto.NotificationDTO;
import com.fooddelivery.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Get user notifications
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        log.info("Fetching notifications for user: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId, Long userId) {
        log.info("Marking notification: {} as read for user: {}", notificationId, userId);
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUser().getId().equals(userId)) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
                log.info("Notification {} marked as read", notificationId);
            }
        });
    }

    /**
     * Convert Notification entity to DTO
     */
    private NotificationDTO mapToDTO(com.fooddelivery.model.entity.Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType().toString())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
