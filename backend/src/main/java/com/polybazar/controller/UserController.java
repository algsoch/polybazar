package com.polybazar.controller;

import com.polybazar.dto.user.*;
import com.polybazar.security.CurrentUser;
import com.polybazar.security.UserPrincipal;
import com.polybazar.service.UserService;
import com.polybazar.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final KycService kycService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @Valid @RequestBody UpdateUserRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(userService.updateUser(currentUser.getId(), request));
    }

    @PostMapping(value = "/me/kyc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KycResponse> submitKyc(
            @RequestParam("gst") MultipartFile gstDocument,
            @RequestParam("pan") MultipartFile panDocument,
            @RequestParam(value = "businessProof", required = false) MultipartFile businessProof,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(kycService.submitKyc(
                currentUser.getId(),
                gstDocument,
                panDocument,
                businessProof
        ));
    }

    @GetMapping("/me/kyc")
    public ResponseEntity<KycResponse> getKycStatus(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(kycService.getKycStatus(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }
}
