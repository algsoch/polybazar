package com.polybazar.controller;

import com.polybazar.dto.kyc.*;
import com.polybazar.dto.product.*;
import com.polybazar.security.CurrentUser;
import com.polybazar.security.UserPrincipal;
import com.polybazar.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // KYC Management
    @GetMapping("/kyc/pending")
    public ResponseEntity<Page<KycListResponse>> getPendingKyc(
            @PageableDefault(size = 20) Pageable pageable) {
        
        return ResponseEntity.ok(adminService.getPendingKyc(pageable));
    }

    @GetMapping("/kyc/{id}")
    public ResponseEntity<KycDetailResponse> getKycDetails(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getKycDetails(id));
    }

    @PutMapping("/kyc/{id}/approve")
    public ResponseEntity<KycListResponse> approveKyc(
            @PathVariable String id,
            @CurrentUser UserPrincipal admin) {
        
        return ResponseEntity.ok(adminService.approveKyc(id, admin.getId()));
    }

    @PutMapping("/kyc/{id}/reject")
    public ResponseEntity<KycListResponse> rejectKyc(
            @PathVariable String id,
            @Valid @RequestBody KycRejectRequest request,
            @CurrentUser UserPrincipal admin) {
        
        return ResponseEntity.ok(adminService.rejectKyc(id, request, admin.getId()));
    }

    // Product Approval
    @GetMapping("/products/pending")
    public ResponseEntity<Page<ProductResponse>> getPendingProducts(
            @PageableDefault(size = 20) Pageable pageable) {
        
        return ResponseEntity.ok(adminService.getPendingProducts(pageable));
    }

    @PutMapping("/products/{id}/approve")
    public ResponseEntity<ProductResponse> approveProduct(
            @PathVariable String id,
            @CurrentUser UserPrincipal admin) {
        
        return ResponseEntity.ok(adminService.approveProduct(id, admin.getId()));
    }

    @PutMapping("/products/{id}/reject")
    public ResponseEntity<ProductResponse> rejectProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRejectRequest request,
            @CurrentUser UserPrincipal admin) {
        
        return ResponseEntity.ok(adminService.rejectProduct(id, request, admin.getId()));
    }

    // Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userId,
            @PageableDefault(size = 50) Pageable pageable) {
        
        return ResponseEntity.ok(adminService.getAuditLogs(action, userId, pageable));
    }
}
