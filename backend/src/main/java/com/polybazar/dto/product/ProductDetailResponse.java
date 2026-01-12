package com.polybazar.dto.product;

import com.polybazar.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailResponse {
    private String id;
    private String title;
    private String description;
    private String category;
    private String type;
    private String grade;
    private String brand;
    private String form;
    private String color;
    private String origin;
    private BigDecimal price;
    private String currency;
    private String priceUnit;
    private BigDecimal minOrderQuantity;
    private BigDecimal availableQuantity;
    private String quantityUnit;
    private List<String> images;
    private String primaryImage;
    private String sellerId;
    private String sellerName;
    private String sellerCompany;
    private Boolean sellerVerified;
    private Product.Location location;
    private Product.ProductSpecs specs;
    private Boolean negotiable;
    private Boolean featured;
    private Integer viewCount;
    private Integer inquiryCount;
    private List<ProductResponse> similarProducts;
    private List<ProductResponse> sellerProducts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private String embeddingId;
    private PricePrediction pricePrediction;

    @Data
    public static class PricePrediction {
        private Double predictedPrice;
        private Double minPrice;
        private Double maxPrice;
        private String trend;
        private Double trendPercentage;
        private Double confidence;
    }
}
