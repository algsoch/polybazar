package com.polybazar.controller;

import com.polybazar.dto.payment.*;
import com.polybazar.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitResponse> initiatePayment(
            @RequestBody PaymentInitRequest request) {
        
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    @GetMapping("/{transactionId}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
            @PathVariable String transactionId) {
        
        return ResponseEntity.ok(paymentService.getPaymentStatus(transactionId));
    }

    // PhonePe Webhook
    @PostMapping("/webhook/phonepe")
    public ResponseEntity<String> phonePeWebhook(
            @RequestBody String payload,
            @RequestHeader("X-VERIFY") String signature) {
        
        log.info("Received PhonePe webhook");
        paymentService.handlePhonePeWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }

    // PayU Webhook
    @PostMapping("/webhook/payu")
    public ResponseEntity<String> payUWebhook(
            @RequestBody Map<String, String> payload) {
        
        log.info("Received PayU webhook");
        paymentService.handlePayUWebhook(payload);
        return ResponseEntity.ok("OK");
    }
}
