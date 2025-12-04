package com.fooddelivery;

import com.fooddelivery.service.*;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;

@TestConfiguration
public class TestConfig {

    @MockBean
    public RedisTemplate<String, Object> redisTemplate;

    @MockBean
    public OrderService orderService;

    @MockBean
    public RestaurantService restaurantService;

    @MockBean
    public DeliveryAssignmentService deliveryAssignmentService;

    @MockBean
    public AuthService authService;
}
