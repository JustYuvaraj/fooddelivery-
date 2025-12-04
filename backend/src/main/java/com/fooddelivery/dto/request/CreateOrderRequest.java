package com.fooddelivery.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    
    @NotNull(message = "Restaurant ID cannot be null")
    private Long restaurantId;
    
    @NotNull(message = "Delivery address ID cannot be null")
    private Long deliveryAddressId;
    
    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;
    
    private String specialInstructions;
}
