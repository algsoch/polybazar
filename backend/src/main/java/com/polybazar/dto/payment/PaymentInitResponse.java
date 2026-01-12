package com.polybazar.dto.payment;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentInitResponse {
    private String paymentId;
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentUrl;
    private String qrCodeUrl;
    private String expiresAt;
}
