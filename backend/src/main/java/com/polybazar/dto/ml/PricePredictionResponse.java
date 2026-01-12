package com.polybazar.dto.ml;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class PricePredictionResponse {
    private BigDecimal predictedPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Double confidence;
    private String priceUnit;
    private String currency;
    private Map<String, Object> factors;
    private String validUntil;
}
