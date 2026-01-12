package com.polybazar.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "products")
@CompoundIndexes({
    @CompoundIndex(name = "category_type_idx", def = "{'category': 1, 'type': 1}"),
    @CompoundIndex(name = "seller_status_idx", def = "{'sellerId': 1, 'status': 1}"),
    @CompoundIndex(name = "location_idx", def = "{'location.coordinates': '2dsphere'}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String id;

    @TextIndexed(weight = 3)
    private String title;

    @TextIndexed(weight = 2)
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

    private Location location;

    private ProductSpecs specs;

    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Builder.Default
    private Boolean featured = false;

    @Builder.Default
    private Boolean negotiable = true;

    @Builder.Default
    private Integer viewCount = 0;

    @Builder.Default
    private Integer inquiryCount = 0;

    private List<Float> embedding;

    private String aiTags;
    private Double aiConfidence;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private String city;
        private String state;
        private String country;
        private String pincode;
        private Double[] coordinates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSpecs {
        private String mfi;
        private String density;
        private String tensileStrength;
        private String flexuralModulus;
        private String heatDeflection;
        private String moistureContent;
        private String ashContent;
        private String viscosity;
        private String purity;
        private String additives;
        private String applications;
        private String certifications;
    }

    public enum ProductStatus {
        DRAFT, ACTIVE, SOLD, ARCHIVED
    }
}
