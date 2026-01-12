package com.polybazar.controller;

import com.polybazar.dto.order.*;
import com.polybazar.security.CurrentUser;
import com.polybazar.security.UserPrincipal;
import com.polybazar.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(orderService.listOrders(currentUser.getId(), status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrder(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(orderService.getOrder(id, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(orderService.createOrder(request, currentUser.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(orderService.updateStatus(id, request, currentUser.getId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable String id,
            @RequestBody(required = false) CancelOrderRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(orderService.cancelOrder(id, request, currentUser.getId()));
    }
}
