package com.polybazar.dto.kyc;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductRejectRequest {
    @NotBlank
    private String reason;
}
