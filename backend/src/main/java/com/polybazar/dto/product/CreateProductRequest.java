package com.polybazar.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class CreateProductRequest {
    
    @NotBlank(message = "Product title is required")
    private String title;
    
    private String name;  // Alias for title
    
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private String type;
    
    @NotBlank(message = "Grade is required")
    private String grade;
    
    private String brand;
    private String form;
    private String color;
    private String origin;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private Double pricePerKg;  // Alternative
    
    private String currency;
    private String priceUnit;
    
    @NotNull(message = "Available quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal availableQuantity;
    
    @Positive
    private BigDecimal minOrderQuantity;
    
    private String quantityUnit;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    // Location details
    private String city;
    private String state;
    private String pincode;
    
    // Images
    private List<String> images;
    
    // Technical specifications
    private Double mfi;
    private Double density;
    private Double tensileStrength;
    private List<String> applications;
    private List<String> certifications;
    
    private Boolean negotiable;
    
    private Map<String, String> specifications;
}
