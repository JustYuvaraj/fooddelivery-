package com.fooddelivery.modules.order.infra;

import com.fooddelivery.model.entity.Order;
import com.fooddelivery.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    Page<Order> findByCustomerIdOrderByPlacedAtDesc(Long customerId, Pageable pageable);
    
    Page<Order> findByRestaurantIdOrderByPlacedAtDesc(Long restaurantId, Pageable pageable);
    
    Page<Order> findByRestaurantIdAndStatusOrderByPlacedAtDesc(
        Long restaurantId, OrderStatus status, Pageable pageable);
    
    List<Order> findByRestaurantIdAndStatusIn(Long restaurantId, List<OrderStatus> statuses);
    
    Page<Order> findByDeliveryAgentIdOrderByPlacedAtDesc(Long agentId, Pageable pageable);
    
    List<Order> findByStatusAndPlacedAtBefore(OrderStatus status, LocalDateTime dateTime);
    
    @Query(value = "SELECT COUNT(o) FROM orders o WHERE o.restaurant_id = :restaurantId " +
           "AND o.placed_at >= CURRENT_TIMESTAMP - INTERVAL '1 day'", nativeQuery = true)
    Integer countOrdersLastDay(@Param("restaurantId") Long restaurantId);

    // Analytics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId " +
           "AND o.placedAt >= :startDate AND o.placedAt <= :endDate")
    Long countOrdersByRestaurantAndDateRange(@Param("restaurantId") Long restaurantId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.restaurant.id = :restaurantId " +
           "AND o.status = 'DELIVERED' AND o.placedAt >= :startDate AND o.placedAt <= :endDate")
    java.math.BigDecimal getRevenueByRestaurantAndDateRange(@Param("restaurantId") Long restaurantId,
                                                           @Param("startDate") LocalDateTime startDate,
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId " +
           "AND o.status = :status AND o.placedAt >= :startDate AND o.placedAt <= :endDate")
    Long countOrdersByStatusAndDateRange(@Param("restaurantId") Long restaurantId,
                                        @Param("status") OrderStatus status,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    List<Order> findByRestaurantIdAndPlacedAtBetween(Long restaurantId, LocalDateTime startDate, LocalDateTime endDate);
}
