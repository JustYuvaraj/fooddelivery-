package com.fooddelivery.modules.analytics.api;

import com.fooddelivery.modules.analytics.application.AnalyticsService;
import com.fooddelivery.modules.analytics.domain.dto.OrderStatisticsDTO;
import com.fooddelivery.modules.analytics.domain.dto.SalesReportDTO;
import com.fooddelivery.modules.analytics.domain.dto.TopSellingItemDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get order statistics for restaurant
     * GET /api/v1/analytics/orders/statistics
     */
    @GetMapping("/orders/statistics")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<OrderStatisticsDTO> getOrderStatistics(Authentication authentication) {
        log.info("Fetching order statistics");
        Long restaurantId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(analyticsService.getOrderStatistics(restaurantId));
    }

    /**
     * Get sales report for date range
     * GET /api/v1/analytics/sales?startDate=2025-01-01&endDate=2025-01-31
     */
    @GetMapping("/sales")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<List<SalesReportDTO>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        log.info("Fetching sales report from {} to {}", startDate, endDate);
        Long restaurantId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(analyticsService.getSalesReport(restaurantId, startDate, endDate));
    }

    /**
     * Get top-selling items
     * GET /api/v1/analytics/top-items?startDate=2025-01-01&endDate=2025-01-31&limit=10
     */
    @GetMapping("/top-items")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<List<TopSellingItemDTO>> getTopSellingItems(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") Integer limit,
            Authentication authentication) {
        log.info("Fetching top {} selling items", limit);
        Long restaurantId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(analyticsService.getTopSellingItems(restaurantId, startDate, endDate, limit));
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
