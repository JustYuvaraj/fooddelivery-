package com.fooddelivery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.response.OrderDTO;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.service.OrderService;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    private OrderDTO mockOrder;
    private CreateOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        mockOrder = OrderDTO.builder()
                .id(1L)
                .customerId(1L)
                .restaurantId(1L)
                .orderNumber("ORD-001")
                .status(OrderStatus.PLACED.toString())
                .items(new ArrayList<>())
                .itemsTotal(BigDecimal.valueOf(500))
                .taxAmount(BigDecimal.valueOf(25))
                .deliveryFee(BigDecimal.valueOf(50))
                .totalAmount(BigDecimal.valueOf(575))
                .placedAt(LocalDateTime.now())
                .build();

        createOrderRequest = new CreateOrderRequest();
        createOrderRequest.setRestaurantId(1L);
        createOrderRequest.setDeliveryAddressId(1L);
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = {"CUSTOMER"})
    void testCreateOrder() throws Exception {
        when(orderService.createOrder(any(CreateOrderRequest.class), anyLong()))
                .thenReturn(mockOrder);

        mockMvc.perform(post("/api/v1/customer/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createOrderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.orderNumber", is("ORD-001")))
                .andExpect(jsonPath("$.status", is("PLACED")));
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = {"CUSTOMER"})
    void testGetCustomerOrders() throws Exception {
        Page<OrderDTO> page = new PageImpl<>(Arrays.asList(mockOrder));
        when(orderService.getCustomerOrders(anyLong(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/customer/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(1)));
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = {"CUSTOMER"})
    void testGetOrderById() throws Exception {
        when(orderService.getOrderById(anyLong()))
                .thenReturn(mockOrder);

        mockMvc.perform(get("/api/v1/customer/orders/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.orderNumber", is("ORD-001")));
    }

    @Test
    @WithMockUser(username = "restaurant@test.com", roles = {"RESTAURANT_OWNER"})
    void testGetRestaurantOrders() throws Exception {
        Page<OrderDTO> page = new PageImpl<>(Arrays.asList(mockOrder));
        when(orderService.getRestaurantOrders(anyLong(), any(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/restaurant/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    void testCreateOrderUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/customer/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createOrderRequest)))
                .andExpect(status().isUnauthorized());
    }
}
