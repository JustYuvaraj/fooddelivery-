package com.fooddelivery.repository;

import com.fooddelivery.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByRestaurantId(Long restaurantId);
    List<Product> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);
    List<Product> findByRestaurantIdAndCategoryAndIsAvailableTrue(Long restaurantId, String category);
}
