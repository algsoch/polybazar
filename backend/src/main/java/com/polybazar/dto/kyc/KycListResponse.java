package com.polybazar.dto.kyc;

import lombok.Data;
import java.util.List;

@Data
public class KycListResponse {
    private List<KycItem> items;
    private int total;
    private int page;
    private int size;
    
    @Data
    public static class KycItem {
        private String id;
        private String userId;
        private String companyName;
        private String status;
        private String submittedAt;
    }
}
