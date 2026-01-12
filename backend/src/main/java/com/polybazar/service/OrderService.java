package com.polybazar.service;

import com.polybazar.dto.order.*;
import com.polybazar.model.Order;
import com.polybazar.repository.OrderRepository;
import com.polybazar.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InvoiceService invoiceService;

    // Methods for controller compatibility
    public Page<OrderResponse> listOrders(String userId, String status, Pageable pageable) {
        // TODO: Implement with proper repository queries
        return new PageImpl<>(new ArrayList<>(), pageable, 0);
    }

    public OrderDetailResponse getOrder(String orderId, String userId) {
        Order order = getOrderById(orderId, userId);
        OrderDetailResponse response = new OrderDetailResponse();
        response.setId(order.getId());
        response.setProductId(order.getProductId());
        response.setProductName(order.getProductTitle());
        response.setBuyerId(order.getBuyerId());
        response.setSellerId(order.getSellerId());
        response.setQuantity(order.getQuantity());
        response.setUnitPrice(order.getUnitPrice());
        response.setTotalAmount(order.getGrandTotal());
        response.setStatus(order.getStatus().name());
        return response;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String buyerId) {
        var product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BigDecimal quantity = request.getQuantity();
        if (quantity.compareTo(product.getMinOrderQuantity()) < 0) {
            throw new RuntimeException("Quantity below minimum order quantity");
        }

        if (quantity.compareTo(product.getAvailableQuantity()) > 0) {
            throw new RuntimeException("Insufficient stock");
        }

        BigDecimal totalPrice = product.getPrice().multiply(quantity);
        BigDecimal gstPercentage = new BigDecimal("18");
        BigDecimal gstAmount = totalPrice.multiply(gstPercentage).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal shippingAmount = calculateShipping("DEFAULT", quantity);
        BigDecimal grandTotal = totalPrice.add(gstAmount).add(shippingAmount);

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .buyerId(buyerId)
                .sellerId(product.getSellerId())
                .productId(request.getProductId())
                .productTitle(product.getTitle())
                .productImage(product.getPrimaryImage())
                .quantity(quantity)
                .quantityUnit(product.getQuantityUnit())
                .unitPrice(product.getPrice())
                .totalPrice(totalPrice)
                .gstAmount(gstAmount)
                .gstPercentage(gstPercentage.doubleValue())
                .shippingAmount(shippingAmount)
                .grandTotal(grandTotal)
                .currency(product.getCurrency())
                .build();

        Order savedOrder = orderRepository.save(order);

        product.setAvailableQuantity(product.getAvailableQuantity().subtract(quantity));
        product.setInquiryCount(product.getInquiryCount() + 1);
        productRepository.save(product);

        log.info("Order created: {} for buyer: {}", orderNumber, buyerId);

        return toOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateStatus(String orderId, UpdateOrderStatusRequest request, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSellerId().equals(userId)) {
            throw new RuntimeException("Only seller can update order status");
        }

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(request.getStatus());
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);

        if (newStatus == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, newStatus);

        return toOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId, CancelOrderRequest request, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel order");
        }

        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel shipped or delivered order");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        if (request != null && request.getReason() != null) {
            order.setNotes(request.getReason());
        }

        var product = productRepository.findById(order.getProductId()).orElse(null);
        if (product != null) {
            product.setAvailableQuantity(product.getAvailableQuantity().add(order.getQuantity()));
            productRepository.save(product);
        }

        Order cancelledOrder = orderRepository.save(order);
        log.info("Order {} cancelled by {}", orderId, userId);

        return toOrderResponse(cancelledOrder);
    }

    private OrderResponse toOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setProductId(order.getProductId());
        response.setProductName(order.getProductTitle());
        response.setBuyerId(order.getBuyerId());
        response.setSellerId(order.getSellerId());
        response.setQuantity(order.getQuantity());
        response.setUnitPrice(order.getUnitPrice());
        response.setTotalAmount(order.getGrandTotal());
        response.setStatus(order.getStatus().name());
        return response;
    }

    // Legacy methods kept for backward compatibility
    @Transactional
    public Order createOrder(String buyerId, String productId, BigDecimal quantity, 
                            String shippingAddress, String billingAddress,
                            String shippingCity, String shippingState, String shippingPincode) {
        
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity.compareTo(product.getMinOrderQuantity()) < 0) {
            throw new RuntimeException("Quantity below minimum order quantity");
        }

        if (quantity.compareTo(product.getAvailableQuantity()) > 0) {
            throw new RuntimeException("Insufficient stock");
        }

        BigDecimal totalPrice = product.getPrice().multiply(quantity);
        BigDecimal gstPercentage = new BigDecimal("18");
        BigDecimal gstAmount = totalPrice.multiply(gstPercentage).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal shippingAmount = calculateShipping(shippingState, quantity);
        BigDecimal grandTotal = totalPrice.add(gstAmount).add(shippingAmount);

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .buyerId(buyerId)
                .sellerId(product.getSellerId())
                .productId(productId)
                .productTitle(product.getTitle())
                .productImage(product.getPrimaryImage())
                .quantity(quantity)
                .quantityUnit(product.getQuantityUnit())
                .unitPrice(product.getPrice())
                .totalPrice(totalPrice)
                .gstAmount(gstAmount)
                .gstPercentage(gstPercentage.doubleValue())
                .shippingAmount(shippingAmount)
                .grandTotal(grandTotal)
                .currency(product.getCurrency())
                .shippingAddress(shippingAddress)
                .billingAddress(billingAddress)
                .shippingCity(shippingCity)
                .shippingState(shippingState)
                .shippingPincode(shippingPincode)
                .build();

        Order savedOrder = orderRepository.save(order);

        product.setAvailableQuantity(product.getAvailableQuantity().subtract(quantity));
        product.setInquiryCount(product.getInquiryCount() + 1);
        productRepository.save(product);

        log.info("Order created: {} for buyer: {}", orderNumber, buyerId);

        return savedOrder;
    }

    public Order getOrderById(String orderId, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        return order;
    }

    public Order getOrderByNumber(String orderNumber, String userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        return order;
    }

    public Page<Order> getBuyerOrders(String buyerId, Pageable pageable) {
        return orderRepository.findByBuyerId(buyerId, pageable);
    }

    public Page<Order> getSellerOrders(String sellerId, Pageable pageable) {
        return orderRepository.findBySellerId(sellerId, pageable);
    }

    @Transactional
    public Order updateOrderStatus(String orderId, Order.OrderStatus newStatus, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSellerId().equals(userId)) {
            throw new RuntimeException("Only seller can update order status");
        }

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);

        if (newStatus == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, newStatus);

        return updatedOrder;
    }

    @Transactional
    public Order updatePaymentStatus(String orderId, Order.PaymentStatus paymentStatus, 
                                     String paymentMethod, String paymentReference) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(paymentStatus);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentReference(paymentReference);

        if (paymentStatus == Order.PaymentStatus.PAID) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            
            String invoiceUrl = invoiceService.generateInvoice(order);
            order.setInvoiceUrl(invoiceUrl);
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} payment updated: {} via {}", orderId, paymentStatus, paymentMethod);

        return updatedOrder;
    }

    @Transactional
    public Order updateTracking(String orderId, String trackingNumber, 
                                String shippingProvider, LocalDateTime expectedDelivery, String sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Only seller can update tracking");
        }

        order.setTrackingNumber(trackingNumber);
        order.setShippingProvider(shippingProvider);
        order.setExpectedDelivery(expectedDelivery);
        order.setStatus(Order.OrderStatus.SHIPPED);

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} tracking updated: {}", orderId, trackingNumber);

        return updatedOrder;
    }

    @Transactional
    public Order cancelOrder(String orderId, String userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel order");
        }

        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel shipped or delivered order");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setNotes(reason);

        var product = productRepository.findById(order.getProductId()).orElse(null);
        if (product != null) {
            product.setAvailableQuantity(product.getAvailableQuantity().add(order.getQuantity()));
            productRepository.save(product);
        }

        Order cancelledOrder = orderRepository.save(order);
        log.info("Order {} cancelled by {}: {}", orderId, userId, reason);

        return cancelledOrder;
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "PB-" + timestamp + "-" + random;
    }

    private BigDecimal calculateShipping(String state, BigDecimal quantity) {
        BigDecimal baseRate = new BigDecimal("500");
        BigDecimal perKgRate = new BigDecimal("10");
        
        if ("Maharashtra".equalsIgnoreCase(state) || "Gujarat".equalsIgnoreCase(state)) {
            baseRate = new BigDecimal("300");
        }
        
        return baseRate.add(perKgRate.multiply(quantity));
    }

    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == Order.OrderStatus.CONFIRMED || next == Order.OrderStatus.CANCELLED;
            case CONFIRMED -> next == Order.OrderStatus.PROCESSING || next == Order.OrderStatus.CANCELLED;
            case PROCESSING -> next == Order.OrderStatus.SHIPPED || next == Order.OrderStatus.CANCELLED;
            case SHIPPED -> next == Order.OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED, REFUNDED -> false;
        };

        if (!valid) {
            throw new RuntimeException("Invalid status transition from " + current + " to " + next);
        }
    }
}
