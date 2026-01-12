package com.polybazar.dto.order;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class OrderDetailResponse extends OrderResponse {
    private ProductInfo product;
    private UserInfo buyer;
    private UserInfo seller;
    private AddressInfo shippingAddress;
    private List<StatusHistory> statusHistory;
    
    @Data
    public static class ProductInfo {
        private String id;
        private String name;
        private String imageUrl;
        private String polymerType;
        private String grade;
    }
    
    @Data
    public static class UserInfo {
        private String id;
        private String companyName;
        private String email;
        private String phone;
    }
    
    @Data
    public static class AddressInfo {
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }
    
    @Data
    public static class StatusHistory {
        private String status;
        private String timestamp;
        private String note;
    }
}
