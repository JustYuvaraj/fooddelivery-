package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReportDTO {
    
    private LocalDate date;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Long completedOrders;
    private Long cancelledOrders;
    private BigDecimal deliveryFees;
    private BigDecimal taxCollected;
}

