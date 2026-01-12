package com.polybazar.dto.ml;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ClassificationResponse {
    private String productId;
    private String polymerType;
    private String grade;
    private Double confidence;
    private List<Alternative> alternatives;
    private Map<String, Object> metadata;
    
    @Data
    public static class Alternative {
        private String polymerType;
        private String grade;
        private Double confidence;
    }
}
