package com.polybazar.repository;

import com.polybazar.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByBuyerId(String buyerId, Pageable pageable);

    Page<Order> findBySellerId(String sellerId, Pageable pageable);

    Page<Order> findByBuyerIdAndStatus(String buyerId, Order.OrderStatus status, Pageable pageable);

    Page<Order> findBySellerIdAndStatus(String sellerId, Order.OrderStatus status, Pageable pageable);

    List<Order> findByStatus(Order.OrderStatus status);

    List<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus);

    @Query("{ '$or': [ { 'buyerId': ?0 }, { 'sellerId': ?0 } ] }")
    Page<Order> findByUserInvolved(String userId, Pageable pageable);

    long countBySellerId(String sellerId);

    long countByBuyerId(String buyerId);

    List<Order> findByProductId(String productId);

    List<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    List<Order> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
    
    @Query(value = "{'sellerId': ?0}", count = true)
    void revokeAllUserTokens(String userId, LocalDateTime revokedAt);
}
