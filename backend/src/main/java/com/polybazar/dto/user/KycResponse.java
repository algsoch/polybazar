package com.polybazar.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KycResponse {
    private String id;
    private String userId;
    private String status;
    private String companyName;
    private String businessType;
    private String gstNumber;
    private String panNumber;
    private String cinNumber;
    private String registeredAddress;
    private List<Document> documents;
    private String submittedAt;
    private String reviewedAt;
    private String rejectionReason;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Document {
        private String id;
        private String type;
        private String fileName;
        private String fileUrl;
        private String status;
    }
}
