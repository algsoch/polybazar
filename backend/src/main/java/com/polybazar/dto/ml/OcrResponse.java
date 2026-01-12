package com.polybazar.dto.ml;

import lombok.Data;
import java.util.Map;

@Data
public class OcrResponse {
    private String extractedText;
    private Double confidence;
    private Map<String, Object> structuredData;
    private String documentType;
    private Map<String, String> fields;
}
