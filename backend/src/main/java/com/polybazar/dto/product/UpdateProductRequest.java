package com.polybazar.dto.product;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class UpdateProductRequest {
    private String title;
    private String name;
    private String description;
    private String category;
    private String type;
    private String grade;
    private String brand;
    private BigDecimal price;
    private Double pricePerKg;
    private BigDecimal availableQuantity;
    private Integer availableQuantityInt;
    private BigDecimal minOrderQuantity;
    private Integer minOrderQuantityInt;
    private String location;
    private String status;
    private List<String> images;
    
    // Location details
    private String city;
    private String state;
    private String pincode;
    
    // Technical specifications
    private Double mfi;
    private Double density;
    private Double tensileStrength;
    private List<String> applications;
    private List<String> certifications;
    
    private Map<String, String> specifications;
}
