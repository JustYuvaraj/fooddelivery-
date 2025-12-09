package com.fooddelivery.repository;

import com.fooddelivery.model.entity.OrderItem;
import com.fooddelivery.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT p.id, p.name, SUM(oi.quantity), SUM(oi.subtotal), AVG(oi.unitPrice), p.category " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.product p " +
           "WHERE o.restaurant.id = :restaurantId AND o.status = :status " +
           "AND o.placedAt >= :startDate AND o.placedAt <= :endDate " +
           "GROUP BY p.id, p.name, p.category " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingItemsByRestaurantAndDateRange(
            @Param("restaurantId") Long restaurantId,
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
