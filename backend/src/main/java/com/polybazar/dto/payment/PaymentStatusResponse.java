package com.polybazar.dto.payment;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentStatusResponse {
    private String paymentId;
    private String orderId;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String method;
    private String transactionId;
    private String paidAt;
    private String failureReason;
    private RefundInfo refund;
    
    @Data
    public static class RefundInfo {
        private String refundId;
        private BigDecimal amount;
        private String status;
        private String reason;
        private String processedAt;
    }
}
