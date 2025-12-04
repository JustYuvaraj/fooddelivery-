package com.fooddelivery.controller;

import com.fooddelivery.dto.response.ProductDTO;
import com.fooddelivery.dto.response.RestaurantDTO;
import com.fooddelivery.service.RestaurantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/v1/restaurants")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    /**
     * Get all active restaurants
     * GET /api/v1/restaurants
     */
    @GetMapping
    public ResponseEntity<Page<RestaurantDTO>> getAllRestaurants(
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching all restaurants");

        Page<RestaurantDTO> restaurants = restaurantService.getAllRestaurants(pageable);
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Search restaurants by cuisine type
     * GET /api/v1/restaurants/search/cuisine
     */
    @GetMapping("/search/cuisine")
    public ResponseEntity<Page<RestaurantDTO>> searchByCuisine(
            @RequestParam String cuisineType,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Searching restaurants by cuisine: {}", cuisineType);

        Page<RestaurantDTO> restaurants = restaurantService.searchByCuisine(cuisineType, pageable);
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Search restaurants by name
     * GET /api/v1/restaurants/search/name
     */
    @GetMapping("/search/name")
    public ResponseEntity<Page<RestaurantDTO>> searchByName(
            @RequestParam String name,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Searching restaurants by name: {}", name);

        Page<RestaurantDTO> restaurants = restaurantService.searchByName(name, pageable);
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Get nearby restaurants based on geo-location
     * GET /api/v1/restaurants/nearby
     */
    @GetMapping("/nearby")
    public ResponseEntity<Page<RestaurantDTO>> getNearbyRestaurants(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "5") Double radiusKm,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Finding restaurants near ({}, {}) within {}km", latitude, longitude, radiusKm);

        Page<RestaurantDTO> restaurants = restaurantService.getNearbyRestaurants(latitude, longitude, radiusKm, pageable);
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Get restaurant details by ID
     * GET /api/v1/restaurants/{id}
     */
    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Long restaurantId) {
        log.info("Fetching restaurant details: {}", restaurantId);

        RestaurantDTO restaurant = restaurantService.getRestaurantById(restaurantId);
        return ResponseEntity.ok(restaurant);
    }

    /**
     * Get all menu items for restaurant
     * GET /api/v1/restaurants/{id}/menu
     */
    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<Page<ProductDTO>> getRestaurantMenu(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching menu for restaurant: {}", restaurantId);

        Page<ProductDTO> menu = restaurantService.getRestaurantMenu(restaurantId, pageable);
        return ResponseEntity.ok(menu);
    }

    /**
     * Get menu items by category
     * GET /api/v1/restaurants/{id}/menu/category
     */
    @GetMapping("/{restaurantId}/menu/category")
    public ResponseEntity<Page<ProductDTO>> getMenuByCategory(
            @PathVariable Long restaurantId,
            @RequestParam String category,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching menu for restaurant {} in category: {}", restaurantId, category);

        Page<ProductDTO> menu = restaurantService.getRestaurantMenuByCategory(restaurantId, category, pageable);
        return ResponseEntity.ok(menu);
    }

    /**
     * Get top rated restaurants
     * GET /api/v1/restaurants/top-rated
     */
    @GetMapping("/top-rated")
    public ResponseEntity<Page<RestaurantDTO>> getTopRatedRestaurants(
            @RequestParam(defaultValue = "10") int limit,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching top {} rated restaurants", limit);

        Page<RestaurantDTO> restaurants = restaurantService.getTopRatedRestaurants(limit, pageable);
        return ResponseEntity.ok(restaurants);
    }
}
