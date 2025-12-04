package com.fooddelivery.controller;

import com.fooddelivery.dto.response.RestaurantDTO;
import com.fooddelivery.service.RestaurantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RestaurantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RestaurantService restaurantService;

    private RestaurantDTO mockRestaurant;

    @BeforeEach
    void setUp() {
        mockRestaurant = RestaurantDTO.builder()
                .id(1L)
                .name("Pizza Palace")
                .description("Best pizza in town")
                .cuisineType("Italian")
                .address("123 Main St")
                .latitude(40.7128)
                .longitude(-74.0060)
                .phone("+1234567890")
                .email("pizza@example.com")
                .openingTime("09:00")
                .closingTime("22:00")
                .prepTimeMins(30)
                .minOrderAmount(BigDecimal.valueOf(100))
                .deliveryRadiusKm(BigDecimal.valueOf(5))
                .rating(4.5)
                .totalReviews(250)
                .isActive(true)
                .isAcceptingOrders(true)
                .build();
    }

    @Test
    void testGetAllRestaurants() throws Exception {
        Page<RestaurantDTO> page = new PageImpl<>(Arrays.asList(mockRestaurant));
        when(restaurantService.getAllRestaurants(any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/restaurants")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Pizza Palace")));
    }

    @Test
    void testSearchByCuisine() throws Exception {
        Page<RestaurantDTO> page = new PageImpl<>(Arrays.asList(mockRestaurant));
        when(restaurantService.searchByCuisine(anyString(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/restaurants/search/cuisine")
                .param("cuisineType", "Italian")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    void testSearchByName() throws Exception {
        Page<RestaurantDTO> page = new PageImpl<>(Arrays.asList(mockRestaurant));
        when(restaurantService.searchByName(anyString(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/restaurants/search/name")
                .param("name", "Pizza")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    void testGetRestaurantById() throws Exception {
        when(restaurantService.getRestaurantById(anyLong()))
                .thenReturn(mockRestaurant);

        mockMvc.perform(get("/api/v1/restaurants/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Pizza Palace")))
                .andExpect(jsonPath("$.rating", is(4.5)));
    }

    @Test
    void testGetNearbyRestaurants() throws Exception {
        Page<RestaurantDTO> page = new PageImpl<>(Arrays.asList(mockRestaurant));
        when(restaurantService.getNearbyRestaurants(any(), any(), any(Double.class), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/restaurants/nearby")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("radiusKm", "5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    void testGetTopRatedRestaurants() throws Exception {
        Page<RestaurantDTO> page = new PageImpl<>(Arrays.asList(mockRestaurant));
        when(restaurantService.getTopRatedRestaurants(anyInt(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/restaurants/top-rated")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }
}
