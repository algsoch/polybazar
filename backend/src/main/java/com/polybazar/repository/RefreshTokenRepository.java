package com.polybazar.repository;

import com.polybazar.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    List<RefreshToken> findByUserId(String userId);

    List<RefreshToken> findByUserIdAndRevokedFalse(String userId);

    long countByUserIdAndRevokedFalse(String userId);

    boolean existsByTokenAndRevokedFalse(String token);
    
    void deleteByExpiresAtBeforeOrRevokedTrue(LocalDateTime now);
    
    // Custom update method - implemented in service layer
    @Query("{ 'userId': ?0, 'revoked': false }")
    @Update("{ '$set': { 'revoked': true, 'revokedAt': ?1 } }")
    void revokeAllUserTokens(String userId, LocalDateTime revokedAt);
}
