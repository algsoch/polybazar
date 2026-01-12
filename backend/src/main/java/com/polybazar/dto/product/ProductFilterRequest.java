package com.polybazar.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductFilterRequest {
    private String query;
    private String category;
    private String type;
    private String grade;
    private String location;
    private Double minPrice;
    private Double maxPrice;
    private Boolean verified;
    private Boolean featured;
    private String sortBy;
    private String sortOrder;
}
