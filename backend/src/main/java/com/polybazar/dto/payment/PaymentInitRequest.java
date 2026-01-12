package com.polybazar.dto.payment;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class PaymentInitRequest {
    @NotBlank
    private String orderId;
    
    @NotNull
    @Positive
    private BigDecimal amount;
    
    @NotBlank
    private String currency;
    
    private String paymentMethod;
    private String returnUrl;
    private Map<String, Object> metadata;
}
