package com.polybazar.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private String id;
    private String title;
    private String name;
    private String description;
    private String category;
    private String type;
    private String grade;
    private String brand;
    private BigDecimal price;
    private Double pricePerKg;
    private String currency;
    private String priceUnit;
    private BigDecimal minOrderQuantity;
    private BigDecimal availableQuantity;
    private Integer availableQuantityInt;
    private Integer minOrderQuantityInt;
    private String quantityUnit;
    private String primaryImage;
    private List<String> images;
    private String sellerId;
    private String sellerName;
    private Boolean sellerVerified;
    private String city;
    private String state;
    private String location;
    private Boolean negotiable;
    private Boolean featured;
    private Boolean verified;
    private Boolean approved;
    private Integer viewCount;
    private Double co2Saved;
    private Map<String, String> specifications;
    private SellerInfo seller;
    private LocalDateTime createdAt;
    private String updatedAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SellerInfo {
        private String id;
        private String name;
        private Boolean verified;
        private Double rating;
        private Integer reviewCount;
    }
}
