package com.fooddelivery.repository;

import com.fooddelivery.model.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    List<Restaurant> findByOwnerIdAndIsActiveTrue(Long ownerId);
    
    List<Restaurant> findByIsActiveAndIsAcceptingOrdersTrue(Boolean isActive);
    
    List<Restaurant> findByIsActiveTrue();
    
    Page<Restaurant> findByIsActiveTrue(Pageable pageable);
    
    Page<Restaurant> findByIsActiveTrueAndCuisineTypeContainingIgnoreCase(String cuisineType, Pageable pageable);
    
    Page<Restaurant> findByIsActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true " +
           "AND r.isAcceptingOrders = true ORDER BY r.rating DESC LIMIT :limit")
    List<Restaurant> findTopRatedRestaurants(@Param("limit") int limit);
    
    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true " +
           "AND r.isAcceptingOrders = true ORDER BY r.rating DESC")
    List<Restaurant> findAllActiveAndAcceptingOrders();
}
