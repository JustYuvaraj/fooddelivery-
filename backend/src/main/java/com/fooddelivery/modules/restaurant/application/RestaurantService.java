package com.fooddelivery.modules.restaurant.application;

import com.fooddelivery.modules.restaurant.domain.dto.RestaurantDTO;
import com.fooddelivery.modules.restaurant.domain.dto.ProductDTO;
import com.fooddelivery.modules.restaurant.domain.dto.CreateProductRequest;
import com.fooddelivery.modules.restaurant.domain.dto.UpdateProductRequest;
import com.fooddelivery.modules.restaurant.domain.dto.UpdateRestaurantRequest;
import com.fooddelivery.modules.restaurant.infra.RestaurantRepository;
import com.fooddelivery.model.entity.Product;
import com.fooddelivery.model.entity.Restaurant;
import com.fooddelivery.repository.ProductRepository;
import com.fooddelivery.util.GeoUtils;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedAccessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final ProductRepository productRepository;

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
     * Get top-rated restaurants
     */
    @Transactional(readOnly = true)
    public List<RestaurantDTO> getTopRatedRestaurants(int limit) {
        log.info("Fetching top {} rated restaurants", limit);
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "rating"));
        return restaurantRepository.findByIsActiveTrueAndIsAcceptingOrdersTrue(pageRequest)
                .getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menu items (products) for a restaurant
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getRestaurantMenu(Long restaurantId) {
        log.info("Fetching menu for restaurant: {}", restaurantId);

        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));

        List<Product> products = productRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
        return products.stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menu items by category
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getRestaurantMenuByCategory(Long restaurantId, String category) {
        log.info("Fetching {} items for restaurant: {}", category, restaurantId);

        List<Product> products = productRepository
                .findByRestaurantIdAndCategoryAndIsAvailableTrue(restaurantId, category);

        return products.stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update restaurant status
     */
    public RestaurantDTO updateRestaurantStatus(Long restaurantId, Boolean isAcceptingOrders, Long ownerId) {
        log.info("Updating restaurant {} acceptance status to: {}", restaurantId, isAcceptingOrders);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));

        verifyRestaurantOwnership(restaurant, ownerId);

        restaurant.setIsAcceptingOrders(isAcceptingOrders);
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);

        log.info("Restaurant {} status updated", restaurantId);
        return mapToDTO(updatedRestaurant);
    }

    /**
     * Get restaurant by owner ID
     */
    @Transactional(readOnly = true)
    public Restaurant getRestaurantByOwnerId(Long ownerId) {
        List<Restaurant> restaurants = restaurantRepository.findByOwnerIdAndIsActiveTrue(ownerId);
        if (restaurants.isEmpty()) {
            throw new ResourceNotFoundException("No restaurant found for owner ID: " + ownerId);
        }
        return restaurants.get(0);
    }

    /**
     * Verify restaurant ownership
     */
    private void verifyRestaurantOwnership(Restaurant restaurant, Long ownerId) {
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not own this restaurant");
        }
    }

    /**
     * Create new menu item/product
     */
    public ProductDTO createProduct(Long restaurantId, Long ownerId, CreateProductRequest request) {
        log.info("Creating product for restaurant: {} by owner: {}", restaurantId, ownerId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        verifyRestaurantOwnership(restaurant, ownerId);

        Product product = Product.builder()
                .restaurant(restaurant)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isVeg(request.getIsVeg() != null ? request.getIsVeg() : false)
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .prepTimeMinutes(request.getPrepTimeMins() != null ? request.getPrepTimeMins() : 15)
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Product created with ID: {}", savedProduct.getId());

        return mapProductToDTO(savedProduct);
    }

    /**
     * Update menu item/product
     */
    public ProductDTO updateProduct(Long productId, Long ownerId, UpdateProductRequest request) {
        log.info("Updating product: {} by owner: {}", productId, ownerId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        verifyRestaurantOwnership(product.getRestaurant(), ownerId);

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getIsVeg() != null) product.setIsVeg(request.getIsVeg());
        if (request.getIsAvailable() != null) product.setIsAvailable(request.getIsAvailable());
        if (request.getPrepTimeMins() != null) product.setPrepTimeMinutes(request.getPrepTimeMins());

        Product updatedProduct = productRepository.save(product);
        log.info("Product {} updated successfully", productId);

        return mapProductToDTO(updatedProduct);
    }

    /**
     * Delete menu item/product
     */
    public void deleteProduct(Long productId, Long ownerId) {
        log.info("Deleting product: {} by owner: {}", productId, ownerId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        verifyRestaurantOwnership(product.getRestaurant(), ownerId);

        productRepository.delete(product);
        log.info("Product {} deleted successfully", productId);
    }

    /**
     * Toggle product availability
     */
    public ProductDTO toggleProductAvailability(Long productId, Long ownerId, Boolean isAvailable) {
        log.info("Toggling availability for product: {} to: {}", productId, isAvailable);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        verifyRestaurantOwnership(product.getRestaurant(), ownerId);

        product.setIsAvailable(isAvailable);
        Product updatedProduct = productRepository.save(product);

        return mapProductToDTO(updatedProduct);
    }

    /**
     * Get all products for restaurant (including unavailable)
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts(Long restaurantId, Long ownerId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        verifyRestaurantOwnership(restaurant, ownerId);

        List<Product> products = productRepository.findByRestaurantId(restaurantId);
        return products.stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update restaurant profile
     */
    public RestaurantDTO updateRestaurantProfile(Long restaurantId, Long ownerId, UpdateRestaurantRequest request) {
        log.info("Updating restaurant profile: {} by owner: {}", restaurantId, ownerId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        verifyRestaurantOwnership(restaurant, ownerId);

        if (request.getName() != null) restaurant.setName(request.getName());
        if (request.getDescription() != null) restaurant.setDescription(request.getDescription());
        if (request.getCuisineType() != null) restaurant.setCuisineType(request.getCuisineType());
        if (request.getAddress() != null) restaurant.setAddress(request.getAddress());
        if (request.getPhone() != null) restaurant.setPhone(request.getPhone());
        if (request.getEmail() != null) restaurant.setEmail(request.getEmail());
        if (request.getOpeningTime() != null) restaurant.setOpeningTime(LocalTime.parse(request.getOpeningTime()));
        if (request.getClosingTime() != null) restaurant.setClosingTime(LocalTime.parse(request.getClosingTime()));
        if (request.getPrepTimeMins() != null) restaurant.setPrepTimeMinutes(request.getPrepTimeMins());
        if (request.getMinOrderAmount() != null) restaurant.setMinOrderAmount(request.getMinOrderAmount().doubleValue());
        if (request.getDeliveryRadiusKm() != null) restaurant.setDeliveryRadiusKm(request.getDeliveryRadiusKm().doubleValue());
        if (request.getLogoUrl() != null) restaurant.setLogoUrl(request.getLogoUrl());
        if (request.getBannerUrl() != null) restaurant.setBannerUrl(request.getBannerUrl());
        if (request.getIsActive() != null) restaurant.setIsActive(request.getIsActive());
        if (request.getIsAcceptingOrders() != null) restaurant.setIsAcceptingOrders(request.getIsAcceptingOrders());

        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant profile {} updated successfully", restaurantId);

        return mapToDTO(updatedRestaurant);
    }

    /**
     * Get restaurant profile by owner
     */
    @Transactional(readOnly = true)
    public RestaurantDTO getRestaurantProfileByOwner(Long ownerId) {
        Restaurant restaurant = getRestaurantByOwnerId(ownerId);
        return mapToDTO(restaurant);
    }

    /**
     * Search nearby restaurants
     */
    @Transactional(readOnly = true)
    public List<RestaurantDTO> getNearbyRestaurants(Double latitude, Double longitude, Double radiusKm) {
        log.info("Searching restaurants near lat: {}, lon: {}, radius: {}km", latitude, longitude, radiusKm);

        List<Restaurant> allRestaurants = restaurantRepository.findByIsActiveTrue();

        return allRestaurants.stream()
                .filter(r -> calculateDistance(latitude, longitude, r.getLatitude(), r.getLongitude()) <= radiusKm)
                .sorted((r1, r2) -> {
                    double dist1 = calculateDistance(latitude, longitude, r1.getLatitude(), r1.getLongitude());
                    double dist2 = calculateDistance(latitude, longitude, r2.getLatitude(), r2.getLongitude());
                    return Double.compare(dist1, dist2);
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return GeoUtils.haversineDistance(lat1, lon1, lat2, lon2);
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
