package com.fooddelivery.modules.restaurant.api;

import com.fooddelivery.modules.restaurant.application.RestaurantService;
import com.fooddelivery.modules.restaurant.domain.dto.RestaurantDTO;
import com.fooddelivery.modules.restaurant.domain.dto.ProductDTO;
import com.fooddelivery.modules.restaurant.domain.dto.CreateProductRequest;
import com.fooddelivery.modules.restaurant.domain.dto.UpdateProductRequest;
import com.fooddelivery.modules.restaurant.domain.dto.UpdateRestaurantRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/restaurants")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    /**
     * Get all active restaurants
     * GET /api/v1/restaurants
     */
    @GetMapping
    public ResponseEntity<Page<RestaurantDTO>> getAllRestaurants(
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching all restaurants");
        return ResponseEntity.ok(restaurantService.getAllRestaurants(pageable));
    }

    /**
     * Get restaurant by ID
     * GET /api/v1/restaurants/{restaurantId}
     */
    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Long restaurantId) {
        log.info("Fetching restaurant: {}", restaurantId);
        return ResponseEntity.ok(restaurantService.getRestaurantById(restaurantId));
    }

    /**
     * Search restaurants by cuisine
     * GET /api/v1/restaurants/search/cuisine?type=Italian
     */
    @GetMapping("/search/cuisine")
    public ResponseEntity<Page<RestaurantDTO>> searchByCuisine(
            @RequestParam String cuisineType,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Searching restaurants by cuisine: {}", cuisineType);
        return ResponseEntity.ok(restaurantService.searchByCuisine(cuisineType, pageable));
    }

    /**
     * Search restaurants by name
     * GET /api/v1/restaurants/search/name?name=Pizza
     */
    @GetMapping("/search/name")
    public ResponseEntity<Page<RestaurantDTO>> searchByName(
            @RequestParam String name,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Searching restaurants by name: {}", name);
        return ResponseEntity.ok(restaurantService.searchByName(name, pageable));
    }

    /**
     * Get top-rated restaurants
     * GET /api/v1/restaurants/top-rated?limit=10
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<RestaurantDTO>> getTopRatedRestaurants(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Fetching top {} rated restaurants", limit);
        return ResponseEntity.ok(restaurantService.getTopRatedRestaurants(limit));
    }

    /**
     * Get nearby restaurants
     * GET /api/v1/restaurants/nearby?latitude=40.7128&longitude=-74.0060&radius=5
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<RestaurantDTO>> getNearbyRestaurants(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5") Double radiusKm) {
        log.info("Searching nearby restaurants at ({}, {}) within {}km", latitude, longitude, radiusKm);
        return ResponseEntity.ok(restaurantService.getNearbyRestaurants(latitude, longitude, radiusKm));
    }

    /**
     * Get restaurant menu
     * GET /api/v1/restaurants/{restaurantId}/menu
     */
    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<List<ProductDTO>> getRestaurantMenu(@PathVariable Long restaurantId) {
        log.info("Fetching menu for restaurant: {}", restaurantId);
        return ResponseEntity.ok(restaurantService.getRestaurantMenu(restaurantId));
    }

    /**
     * Get menu by category
     * GET /api/v1/restaurants/{restaurantId}/menu/category?category=Appetizers
     */
    @GetMapping("/{restaurantId}/menu/category")
    public ResponseEntity<List<ProductDTO>> getMenuByCategory(
            @PathVariable Long restaurantId,
            @RequestParam String category) {
        log.info("Fetching {} items for restaurant: {}", category, restaurantId);
        return ResponseEntity.ok(restaurantService.getRestaurantMenuByCategory(restaurantId, category));
    }

    /**
     * Update restaurant status (owner only)
     * PATCH /api/v1/restaurants/{restaurantId}/status
     */
    @PatchMapping("/{restaurantId}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantDTO> updateRestaurantStatus(
            @PathVariable Long restaurantId,
            @RequestParam Boolean isAcceptingOrders,
            Authentication authentication) {
        log.info("Updating restaurant {} acceptance status to: {}", restaurantId, isAcceptingOrders);
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(restaurantService.updateRestaurantStatus(restaurantId, isAcceptingOrders, ownerId));
    }

    /**
     * Update restaurant profile (owner only)
     * PUT /api/v1/restaurants/{restaurantId}/profile
     */
    @PutMapping("/{restaurantId}/profile")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantDTO> updateRestaurantProfile(
            @PathVariable Long restaurantId,
            @Valid @RequestBody UpdateRestaurantRequest request,
            Authentication authentication) {
        log.info("Updating restaurant profile: {}", restaurantId);
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(restaurantService.updateRestaurantProfile(restaurantId, ownerId, request));
    }

    /**
     * Get restaurant profile (owner only)
     * GET /api/v1/restaurants/owner/profile
     */
    @GetMapping("/owner/profile")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantDTO> getRestaurantProfile(Authentication authentication) {
        log.info("Fetching restaurant profile for owner");
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(restaurantService.getRestaurantProfileByOwner(ownerId));
    }

    /**
     * Create product (owner only)
     * POST /api/v1/restaurants/{restaurantId}/products
     */
    @PostMapping("/{restaurantId}/products")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ProductDTO> createProduct(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CreateProductRequest request,
            Authentication authentication) {
        log.info("Creating product for restaurant: {}", restaurantId);
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restaurantService.createProduct(restaurantId, ownerId, request));
    }

    /**
     * Update product (owner only)
     * PUT /api/v1/restaurants/products/{productId}
     */
    @PutMapping("/products/{productId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateProductRequest request,
            Authentication authentication) {
        log.info("Updating product: {}", productId);
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(restaurantService.updateProduct(productId, ownerId, request));
    }

    /**
     * Delete product (owner only)
     * DELETE /api/v1/restaurants/products/{productId}
     */
    @DeleteMapping("/products/{productId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            Authentication authentication) {
        log.info("Deleting product: {}", productId);
        Long ownerId = extractUserIdFromAuth(authentication);
        restaurantService.deleteProduct(productId, ownerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle product availability (owner only)
     * PATCH /api/v1/restaurants/products/{productId}/availability
     */
    @PatchMapping("/products/{productId}/availability")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ProductDTO> toggleProductAvailability(
            @PathVariable Long productId,
            @RequestParam Boolean isAvailable,
            Authentication authentication) {
        log.info("Toggling availability for product: {} to: {}", productId, isAvailable);
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(restaurantService.toggleProductAvailability(productId, ownerId, isAvailable));
    }

    /**
     * Get all products for restaurant (owner only)
     * GET /api/v1/restaurants/{restaurantId}/products
     */
    @GetMapping("/{restaurantId}/products")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<List<ProductDTO>> getAllProducts(
            @PathVariable Long restaurantId,
            Authentication authentication) {
        log.info("Fetching all products for restaurant: {}", restaurantId);
        Long ownerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(restaurantService.getAllProducts(restaurantId, ownerId));
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
