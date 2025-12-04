package com.fooddelivery.model.enums;

public enum OrderStatus {
    PLACED,           // Customer placed order
    CONFIRMED,        // Restaurant confirmed
    PREPARING,        // Kitchen is preparing
    READY,            // Ready for pickup
    ASSIGNED,         // Delivery agent assigned
    PICKED_UP,        // Agent picked up order
    OUT_FOR_DELIVERY, // On the way
    DELIVERED,        // Successfully delivered
    CANCELLED         // Order cancelled
}
