package com.fooddelivery.modules.analytics.application;

import com.fooddelivery.modules.analytics.domain.dto.OrderStatisticsDTO;
import com.fooddelivery.modules.analytics.domain.dto.SalesReportDTO;
import com.fooddelivery.modules.analytics.domain.dto.TopSellingItemDTO;
import com.fooddelivery.model.entity.Order;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.modules.order.infra.OrderRepository;
import com.fooddelivery.repository.OrderItemRepository;
import com.fooddelivery.modules.restaurant.infra.RestaurantRepository;
import com.fooddelivery.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantRepository restaurantRepository;

    /**
     * Get order statistics for restaurant
     */
    @Transactional(readOnly = true)
    public OrderStatisticsDTO getOrderStatistics(Long restaurantId) {
        log.info("Generating order statistics for restaurant: {}", restaurantId);
        verifyRestaurantOwnership(restaurantId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime startOfWeek = startOfToday.minusDays(7);
        LocalDateTime startOfMonth = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);

        List<Order> allOrders = orderRepository.findByRestaurantIdAndPlacedAtBetween(
                restaurantId, LocalDateTime.of(2020, 1, 1, 0, 0), now);

        List<OrderStatus> activeStatuses = Arrays.asList(
                OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING,
                OrderStatus.READY, OrderStatus.ASSIGNED, OrderStatus.PICKED_UP,
                OrderStatus.OUT_FOR_DELIVERY);
        Long activeOrders = allOrders.stream()
                .filter(o -> activeStatuses.contains(o.getStatus()))
                .count();

        Long completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count();

        Long cancelledOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                .count();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgOrderValue = completedOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal todayRevenue = calculateRevenue(restaurantId, startOfToday, now);
        BigDecimal weekRevenue = calculateRevenue(restaurantId, startOfWeek, now);
        BigDecimal monthRevenue = calculateRevenue(restaurantId, startOfMonth, now);

        Map<String, Long> ordersByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatus().name(),
                        Collectors.counting()));

        return OrderStatisticsDTO.builder()
                .totalOrders((long) allOrders.size())
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .averageOrderValue(avgOrderValue)
                .todayRevenue(todayRevenue)
                .weekRevenue(weekRevenue)
                .monthRevenue(monthRevenue)
                .ordersByStatus(ordersByStatus)
                .reportGeneratedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Get sales report for date range
     */
    @Transactional(readOnly = true)
    public List<SalesReportDTO> getSalesReport(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        log.info("Generating sales report for restaurant: {} from {} to {}", restaurantId, startDate, endDate);
        verifyRestaurantOwnership(restaurantId);

        List<SalesReportDTO> reports = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            LocalDateTime dayStart = LocalDateTime.of(currentDate, LocalTime.MIN);
            LocalDateTime dayEnd = LocalDateTime.of(currentDate, LocalTime.MAX);

            List<Order> dayOrders = orderRepository.findByRestaurantIdAndPlacedAtBetween(
                    restaurantId, dayStart, dayEnd);

            Long totalOrders = (long) dayOrders.size();
            Long completedOrders = dayOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                    .count();
            Long cancelledOrders = dayOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                    .count();

            BigDecimal totalRevenue = dayOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal deliveryFees = dayOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                    .map(Order::getDeliveryFee)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal taxCollected = dayOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                    .map(Order::getTaxAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal avgOrderValue = completedOrders > 0
                    ? totalRevenue.divide(BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            reports.add(SalesReportDTO.builder()
                    .date(currentDate)
                    .totalOrders(totalOrders)
                    .totalRevenue(totalRevenue)
                    .averageOrderValue(avgOrderValue)
                    .completedOrders(completedOrders)
                    .cancelledOrders(cancelledOrders)
                    .deliveryFees(deliveryFees)
                    .taxCollected(taxCollected)
                    .build());

            currentDate = currentDate.plusDays(1);
        }

        return reports;
    }

    /**
     * Get top-selling items
     */
    @Transactional(readOnly = true)
    public List<TopSellingItemDTO> getTopSellingItems(Long restaurantId, LocalDate startDate, LocalDate endDate, Integer limit) {
        log.info("Getting top selling items for restaurant: {}", restaurantId);
        verifyRestaurantOwnership(restaurantId);

        LocalDateTime start = LocalDateTime.of(startDate, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(endDate, LocalTime.MAX);

        List<Object[]> results = orderItemRepository.findTopSellingItemsByRestaurantAndDateRange(
                restaurantId, OrderStatus.DELIVERED, start, end);

        return results.stream()
                .limit(limit != null ? limit : 10)
                .map(result -> TopSellingItemDTO.builder()
                        .productId(((Number) result[0]).longValue())
                        .productName((String) result[1])
                        .quantitySold(((Number) result[2]).longValue())
                        .totalRevenue((BigDecimal) result[3])
                        .averagePrice((BigDecimal) result[4])
                        .category((String) result[5])
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Calculate revenue for a date range
     */
    private BigDecimal calculateRevenue(Long restaurantId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = orderRepository.getRevenueByRestaurantAndDateRange(restaurantId, startDate, endDate);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    /**
     * Verify restaurant ownership
     */
    private void verifyRestaurantOwnership(Long restaurantId) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));
    }
}
