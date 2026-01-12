package com.polybazar.dto.ml;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Map;

@Data
public class PricePredictionRequest {
    @NotBlank
    private String polymerType;
    
    @NotBlank
    private String grade;
    
    private Double quantity;
    private String region;
    private String quality;
    private Map<String, Object> additionalParams;
}
