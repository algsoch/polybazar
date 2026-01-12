package com.polybazar.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "orders")
@CompoundIndexes({
    @CompoundIndex(name = "buyer_status_idx", def = "{'buyerId': 1, 'status': 1}"),
    @CompoundIndex(name = "seller_status_idx", def = "{'sellerId': 1, 'status': 1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNumber;

    @Indexed
    private String buyerId;

    @Indexed
    private String sellerId;

    private String productId;

    private String productTitle;

    private String productImage;

    private BigDecimal quantity;

    private String quantityUnit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private BigDecimal gstAmount;

    private Double gstPercentage;

    private BigDecimal shippingAmount;

    private BigDecimal grandTotal;

    private String currency;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentMethod;

    private String paymentReference;

    private String shippingAddress;

    private String billingAddress;

    private String shippingCity;

    private String shippingState;

    private String shippingPincode;

    private String trackingNumber;

    private String shippingProvider;

    private LocalDateTime expectedDelivery;

    private LocalDateTime deliveredAt;

    private String notes;

    private String negotiationChatId;

    private String invoiceId;

    private String invoiceUrl;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }
}
