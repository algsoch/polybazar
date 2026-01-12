package com.polybazar.controller;

import com.polybazar.service.InvoiceService;
import com.polybazar.security.CurrentUser;
import com.polybazar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(invoiceService.getInvoice(id, currentUser.getId()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser) {
        
        byte[] pdfBytes = invoiceService.generatePdf(id, currentUser.getId());
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{id}/url")
    public ResponseEntity<InvoiceUrlResponse> getInvoiceUrl(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser) {
        
        String signedUrl = invoiceService.getSignedUrl(id, currentUser.getId());
        return ResponseEntity.ok(new InvoiceUrlResponse(signedUrl));
    }

    // DTOs
    public record InvoiceResponse(
            String id,
            String orderId,
            String invoiceNumber,
            String buyerName,
            String buyerGstin,
            String sellerName,
            String sellerGstin,
            Double subtotal,
            Double taxAmount,
            Double totalAmount,
            String status,
            String createdAt
    ) {}

    public record InvoiceUrlResponse(String url) {}
}
