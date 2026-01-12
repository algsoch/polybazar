package com.polybazar.dto.order;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    @NotBlank
    private String productId;
    
    @NotNull
    @Positive
    private BigDecimal quantity;
    
    @NotNull
    @Positive
    private BigDecimal offeredPrice;
    
    private String shippingAddressId;
    private String notes;
}
