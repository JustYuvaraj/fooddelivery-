package com.fooddelivery.service;

import com.fooddelivery.dto.response.ProductDTO;
import com.fooddelivery.dto.response.RestaurantDTO;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.model.entity.Product;
import com.fooddelivery.model.entity.Restaurant;
import com.fooddelivery.repository.ProductRepository;
import com.fooddelivery.repository.RestaurantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get restaurant by ID
     */
    @Transactional(readOnly = true)
    public RestaurantDTO getRestaurantById(Long restaurantId) {
        log.info("Fetching restaurant with ID: {}", restaurantId);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));
        return mapToDTO(restaurant);
    }

    /**
     * Get all active restaurants
     */
    @Transactional(readOnly = true)
    public Page<RestaurantDTO> getAllRestaurants(Pageable pageable) {
        log.info("Fetching all active restaurants");
        return restaurantRepository.findByIsActiveTrue(pageable)
                .map(this::mapToDTO);
    }

    /**
     * Search restaurants by cuisine type
     */
    @Transactional(readOnly = true)
    public Page<RestaurantDTO> searchByCuisine(String cuisineType, Pageable pageable) {
        log.info("Searching restaurants by cuisine: {}", cuisineType);
        return restaurantRepository.findByIsActiveTrueAndCuisineTypeContainingIgnoreCase(cuisineType, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Search restaurants by name
     */
    @Transactional(readOnly = true)
    public Page<RestaurantDTO> searchByName(String name, Pageable pageable) {
        log.info("Searching restaurants by name: {}", name);
        return restaurantRepository.findByIsActiveTrueAndNameContainingIgnoreCase(name, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get menu items (products) for a restaurant
     */
    @Transactional(readOnly = true)
    public Page<ProductDTO> getRestaurantMenu(Long restaurantId, Pageable pageable) {
        log.info("Fetching menu for restaurant: {}", restaurantId);

        // Verify restaurant exists
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));

        return productRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId, pageable)
                .map(this::mapProductToDTO);
    }

    /**
     * Get menu items by category
     */
    @Transactional(readOnly = true)
    public Page<ProductDTO> getRestaurantMenuByCategory(Long restaurantId, String category, Pageable pageable) {
        log.info("Fetching {} items for restaurant: {}", category, restaurantId);

        return productRepository
                .findByRestaurantIdAndCategoryAndIsAvailableTrue(restaurantId, category, pageable)
                .map(this::mapProductToDTO);
    }

    /**
     * Get top-rated restaurants
     */
    @Transactional(readOnly = true)
    public Page<RestaurantDTO> getTopRatedRestaurants(int limit, Pageable pageable) {
        log.info("Fetching top {} rated restaurants", limit);
        return restaurantRepository.findTopRatedRestaurants(limit, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Update restaurant status
     */
    public RestaurantDTO updateRestaurantStatus(Long restaurantId, Boolean isAcceptingOrders) {
        log.info("Updating restaurant {} acceptance status to: {}", restaurantId, isAcceptingOrders);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));

        restaurant.setIsAcceptingOrders(isAcceptingOrders);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);

        log.info("Restaurant {} status updated", restaurantId);
        return mapToDTO(updatedRestaurant);
    }

    /**
     * Search nearby restaurants
     */
    @Transactional(readOnly = true)
    public Page<RestaurantDTO> getNearbyRestaurants(java.math.BigDecimal latitude, java.math.BigDecimal longitude, Double radiusKm, Pageable pageable) {
        log.info("Searching restaurants near lat: {}, lon: {}, radius: {}km", latitude, longitude, radiusKm);

        // Using simple distance calculation (Haversine formula)
        // In production, use PostGIS or database geo-spatial queries
        List<Restaurant> allRestaurants = restaurantRepository.findByIsActiveTrue();

        List<RestaurantDTO> filtered = allRestaurants.stream()
                .filter(r -> calculateDistance(latitude.doubleValue(), longitude.doubleValue(), r.getLatitude(), r.getLongitude()) <= radiusKm)
                .sorted((r1, r2) -> {
                    double dist1 = calculateDistance(latitude.doubleValue(), longitude.doubleValue(), r1.getLatitude(), r1.getLongitude());
                    double dist2 = calculateDistance(latitude.doubleValue(), longitude.doubleValue(), r2.getLatitude(), r2.getLongitude());
                    return Double.compare(dist1, dist2);
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        // Apply pagination manually on sorted list
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<RestaurantDTO> pageContent = filtered.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
    }

    /**
     * Calculate distance using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    /**
     * Convert Restaurant entity to DTO
     */
    private RestaurantDTO mapToDTO(Restaurant restaurant) {
        return RestaurantDTO.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .cuisineType(restaurant.getCuisineType())
                .address(restaurant.getAddress())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .phone(restaurant.getPhone())
                .email(restaurant.getEmail())
                .openingTime(restaurant.getOpeningTime().toString())
                .closingTime(restaurant.getClosingTime().toString())
                .prepTimeMins(restaurant.getPrepTimeMinutes())
                .minOrderAmount(java.math.BigDecimal.valueOf(restaurant.getMinOrderAmount()))
                .deliveryRadiusKm(java.math.BigDecimal.valueOf(restaurant.getDeliveryRadiusKm()))
                .rating(restaurant.getRating())
                .totalReviews(restaurant.getTotalReviews())
                .isActive(restaurant.getIsActive())
                .isAcceptingOrders(restaurant.getIsAcceptingOrders())
                .logoUrl(restaurant.getLogoUrl())
                .bannerUrl(restaurant.getBannerUrl())
                .build();
    }

    /**
     * Convert Product entity to DTO
     */
    private ProductDTO mapProductToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .restaurantId(product.getRestaurant().getId())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .isVeg(product.getIsVeg())
                .isAvailable(product.getIsAvailable())
                .prepTimeMins(product.getPrepTimeMinutes())
                .build();
    }
}
