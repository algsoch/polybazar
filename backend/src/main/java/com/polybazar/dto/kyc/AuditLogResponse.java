package com.polybazar.dto.kyc;

import lombok.Data;
import java.util.List;

@Data
public class AuditLogResponse {
    private List<AuditEntry> entries;
    private int total;
    private int page;
    private int size;
    
    @Data
    public static class AuditEntry {
        private String id;
        private String action;
        private String entityType;
        private String entityId;
        private String userId;
        private String userName;
        private String details;
        private String timestamp;
        private String ipAddress;
    }
}
