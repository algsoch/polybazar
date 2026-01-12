package com.polybazar.repository;

import com.polybazar.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    Page<ChatMessage> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);

    List<ChatMessage> findByRoomIdOrderByCreatedAtAsc(String roomId);

    @Query("{'roomId': ?0, 'createdAt': {$gt: ?1}}")
    List<ChatMessage> findNewMessages(String roomId, LocalDateTime after);

    @Query("{'receiverId': ?0, 'read': false}")
    List<ChatMessage> findUnreadMessages(String receiverId);

    @Query("{'receiverId': ?0, 'read': false}")
    long countUnreadMessages(String receiverId);

    @Query("{'roomId': ?0, 'receiverId': ?1, 'read': false}")
    long countUnreadMessagesInRoom(String roomId, String receiverId);

    @Query("{'roomId': ?0, 'receiverId': ?1, 'read': false}")
    @Update("{'$set': {'read': true, 'readAt': ?2}}")
    void markMessagesAsRead(String roomId, String receiverId, LocalDateTime readAt);

    @Query("{'$or': [{'senderId': ?0}, {'receiverId': ?0}]}")
    List<ChatMessage> findUserMessages(String userId);

    @Query("{'type': 'OFFER', 'offer.status': 'PENDING', 'offer.productId': ?0}")
    List<ChatMessage> findPendingOffersForProduct(String productId);

    @Query("{'senderId': ?0, 'receiverId': ?1}")
    List<ChatMessage> findConversation(String user1Id, String user2Id);

    @Query(value = "{'roomId': ?0}", sort = "{'createdAt': -1}")
    ChatMessage findLatestMessage(String roomId);

    void deleteByRoomId(String roomId);
}
