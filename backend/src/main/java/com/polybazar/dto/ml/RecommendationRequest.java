package com.polybazar.dto.ml;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class RecommendationRequest {
    private String userId;
    
    @NotNull
    private List<String> productIds;
    
    private String polymerType;
    private String grade;
    private Integer limit;
    private Map<String, Object> preferences;
}
