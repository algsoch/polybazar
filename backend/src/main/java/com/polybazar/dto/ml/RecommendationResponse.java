package com.polybazar.dto.ml;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RecommendationResponse {
    private List<RecommendedProduct> products;
    private String strategy;
    
    @Data
    public static class RecommendedProduct {
        private String productId;
        private String name;
        private String polymerType;
        private String grade;
        private BigDecimal price;
        private Double score;
        private String reason;
        private String imageUrl;
        private String sellerId;
    }
}
