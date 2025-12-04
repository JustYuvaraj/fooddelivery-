package com.fooddelivery.exception;

public class RestaurantNotFoundException extends ResourceNotFoundException {
    
    public RestaurantNotFoundException(String message) {
        super(message);
    }
}
