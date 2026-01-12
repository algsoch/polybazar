package com.polybazar.service;

import com.polybazar.dto.user.KycResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@Slf4j
public class KycService {

    public KycResponse submitKyc(
            String userId,
            MultipartFile gstDocument,
            MultipartFile panDocument,
            MultipartFile businessProof) {
        
        // TODO: Implement actual KYC submission logic
        log.info("Submitting KYC for user: {}", userId);
        log.info("GST Document: {}", gstDocument != null ? gstDocument.getOriginalFilename() : "null");
        log.info("PAN Document: {}", panDocument != null ? panDocument.getOriginalFilename() : "null");
        log.info("Business Proof: {}", businessProof != null ? businessProof.getOriginalFilename() : "null");
        
        return KycResponse.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .status("PENDING")
                .build();
    }

    public KycResponse getKycStatus(String userId) {
        // TODO: Implement actual KYC status fetching
        log.info("Getting KYC status for user: {}", userId);
        
        return KycResponse.builder()
                .userId(userId)
                .status("PENDING")
                .build();
    }
}
