package com.polybazar.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@CompoundIndex(name = "chat_room_idx", def = "{'roomId': 1, 'createdAt': 1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    private String roomId;

    private String senderId;
    private String senderName;
    private String senderAvatar;

    private String receiverId;

    private String content;

    @Builder.Default
    private MessageType type = MessageType.TEXT;

    private NegotiationOffer offer;

    @Builder.Default
    private Boolean read = false;

    private LocalDateTime readAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NegotiationOffer {
        private String productId;
        private String productTitle;
        private Double originalPrice;
        private Double offeredPrice;
        private Double quantity;
        private String quantityUnit;
        private OfferStatus status;
        private String counterMessage;
    }

    public enum MessageType {
        TEXT, OFFER, COUNTER_OFFER, OFFER_ACCEPTED, OFFER_REJECTED, SYSTEM, IMAGE
    }

    public enum OfferStatus {
        PENDING, ACCEPTED, REJECTED, COUNTERED, EXPIRED
    }
}
