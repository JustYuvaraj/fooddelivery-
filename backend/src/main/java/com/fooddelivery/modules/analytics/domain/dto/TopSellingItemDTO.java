package com.fooddelivery.modules.analytics.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingItemDTO {
    private Long productId;
    private String productName;
    private Long quantitySold;
    private BigDecimal totalRevenue;
    private BigDecimal averagePrice;
    private String category;
}
