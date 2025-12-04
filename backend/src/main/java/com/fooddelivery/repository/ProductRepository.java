package com.fooddelivery.repository;

import com.fooddelivery.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByRestaurantId(Long restaurantId);
    
    List<Product> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);
    
    Page<Product> findByRestaurantIdAndIsAvailableTrue(Long restaurantId, Pageable pageable);
    
    List<Product> findByRestaurantIdAndCategory(Long restaurantId, String category);
    
    List<Product> findByRestaurantIdAndCategoryAndIsAvailableTrue(Long restaurantId, String category);
    
    Page<Product> findByRestaurantIdAndCategoryAndIsAvailableTrue(Long restaurantId, String category, Pageable pageable);
}
