package com.polybazar.dto.kyc;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class KycDetailResponse {
    private String id;
    private String userId;
    private String companyName;
    private String businessType;
    private String gstNumber;
    private String panNumber;
    private String cinNumber;
    private String registeredAddress;
    private String status;
    private String submittedAt;
    private String reviewedAt;
    private String reviewedBy;
    private String rejectionReason;
    private List<Document> documents;
    private Map<String, Object> additionalInfo;
    
    @Data
    public static class Document {
        private String id;
        private String type;
        private String fileName;
        private String fileUrl;
        private String status;
    }
}
