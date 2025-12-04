package com.fooddelivery.repository;

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
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId " +
           "AND o.placedAt >= CURRENT_TIMESTAMP - INTERVAL '1 day'")
    Integer countOrdersLastDay(@Param("restaurantId") Long restaurantId);
}
