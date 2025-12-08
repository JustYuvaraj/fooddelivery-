package com.fooddelivery.modules.notification.api;

import com.fooddelivery.modules.notification.application.NotificationService;
import com.fooddelivery.modules.notification.domain.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get user notifications
     * GET /api/v1/notifications
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching notifications for user");
        Long userId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, pageable));
    }

    /**
     * Mark notification as read
     * PATCH /api/v1/notifications/{notificationId}/read
     */
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {
        log.info("Marking notification {} as read", notificationId);
        Long userId = extractUserIdFromAuth(authentication);
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.fooddelivery.security.CustomUserDetails) {
            com.fooddelivery.security.CustomUserDetails userDetails =
                (com.fooddelivery.security.CustomUserDetails) authentication.getPrincipal();
            return userDetails.getId();
        }
        throw new IllegalStateException("Unable to extract user ID from authentication");
    }
}
