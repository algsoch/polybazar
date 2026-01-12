package com.polybazar.controller;

import com.polybazar.model.ChatMessage;
import com.polybazar.repository.ChatMessageRepository;
import com.polybazar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId,
                           @Payload ChatMessage message,
                           @AuthenticationPrincipal UserPrincipal user) {
        
        message.setRoomId(roomId);
        message.setSenderId(user.getId());
        message.setSenderName(user.getName());
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
        
        messagingTemplate.convertAndSendToUser(
                message.getReceiverId(),
                "/queue/notifications",
                createNotification(savedMessage)
        );
        
        log.info("Message sent in room {} from {} to {}", roomId, user.getId(), message.getReceiverId());
    }

    @MessageMapping("/chat/{roomId}/offer")
    public void sendOffer(@DestinationVariable String roomId,
                         @Payload ChatMessage.NegotiationOffer offer,
                         @AuthenticationPrincipal UserPrincipal user) {
        
        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .senderId(user.getId())
                .senderName(user.getName())
                .type(ChatMessage.MessageType.OFFER)
                .offer(offer)
                .content("New offer: ₹" + offer.getOfferedPrice() + " for " + offer.getQuantity() + " " + offer.getQuantityUnit())
                .build();
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
        
        log.info("Offer sent in room {} from {}: ₹{}", roomId, user.getId(), offer.getOfferedPrice());
    }

    @MessageMapping("/chat/{roomId}/offer/respond")
    public void respondToOffer(@DestinationVariable String roomId,
                              @Payload OfferResponse response,
                              @AuthenticationPrincipal UserPrincipal user) {
        
        ChatMessage originalMessage = chatMessageRepository.findById(response.messageId())
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        ChatMessage.NegotiationOffer offer = originalMessage.getOffer();
        
        if (response.accepted()) {
            offer.setStatus(ChatMessage.OfferStatus.ACCEPTED);
        } else if (response.counterPrice() != null) {
            offer.setStatus(ChatMessage.OfferStatus.COUNTERED);
            
            ChatMessage counterMessage = ChatMessage.builder()
                    .roomId(roomId)
                    .senderId(user.getId())
                    .senderName(user.getName())
                    .type(ChatMessage.MessageType.COUNTER_OFFER)
                    .offer(ChatMessage.NegotiationOffer.builder()
                            .productId(offer.getProductId())
                            .productTitle(offer.getProductTitle())
                            .originalPrice(offer.getOriginalPrice())
                            .offeredPrice(response.counterPrice())
                            .quantity(offer.getQuantity())
                            .quantityUnit(offer.getQuantityUnit())
                            .status(ChatMessage.OfferStatus.PENDING)
                            .build())
                    .content("Counter offer: ₹" + response.counterPrice())
                    .build();
            
            chatMessageRepository.save(counterMessage);
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, counterMessage);
        } else {
            offer.setStatus(ChatMessage.OfferStatus.REJECTED);
        }
        
        chatMessageRepository.save(originalMessage);
        
        ChatMessage statusMessage = ChatMessage.builder()
                .roomId(roomId)
                .senderId(user.getId())
                .senderName(user.getName())
                .type(response.accepted() ? ChatMessage.MessageType.OFFER_ACCEPTED : ChatMessage.MessageType.OFFER_REJECTED)
                .content(response.accepted() ? "Offer accepted!" : "Offer declined")
                .build();
        
        chatMessageRepository.save(statusMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, statusMessage);
        
        log.info("Offer {} in room {} by {}", response.accepted() ? "accepted" : "declined", roomId, user.getId());
    }

    @MessageMapping("/chat/{roomId}/typing")
    public void userTyping(@DestinationVariable String roomId,
                          @AuthenticationPrincipal UserPrincipal user) {
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing", 
                new TypingNotification(user.getId(), user.getName()));
    }

    @MessageMapping("/chat/{roomId}/read")
    public void markAsRead(@DestinationVariable String roomId,
                          @AuthenticationPrincipal UserPrincipal user) {
        chatMessageRepository.markMessagesAsRead(roomId, user.getId(), LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/read", 
                new ReadReceipt(user.getId(), LocalDateTime.now()));
    }

    private ChatNotification createNotification(ChatMessage message) {
        return new ChatNotification(
                message.getRoomId(),
                message.getSenderId(),
                message.getSenderName(),
                message.getContent(),
                message.getType().name()
        );
    }

    public record OfferResponse(String messageId, boolean accepted, Double counterPrice) {}
    public record TypingNotification(String userId, String userName) {}
    public record ReadReceipt(String userId, LocalDateTime timestamp) {}
    public record ChatNotification(String roomId, String senderId, String senderName, String content, String type) {}
}
