package com.polybazar.dto.kyc;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KycRejectRequest {
    @NotBlank
    private String reason;
}
