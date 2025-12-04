package com.fooddelivery.model.enums;

public enum AssignmentStatus {
    PENDING,    // Sent to agent, awaiting acceptance
    ACCEPTED,   // Agent accepted
    REJECTED,   // Agent rejected
    COMPLETED,  // Delivery completed
    CANCELLED   // Assignment cancelled
}
