package com.polybazar.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String name;

    private String phoneNumber;

    private String companyName;

    private String gstNumber;

    private String address;

    private String city;
    private String state;
    private String pincode;

    @Builder.Default
    private UserRole role = UserRole.BUYER;

    @Builder.Default
    private KycStatus kycStatus = KycStatus.PENDING;

    private String kycDocumentType;

    private String kycDocumentUrl;

    private LocalDateTime kycVerifiedAt;

    private String avatarUrl;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean emailVerified = false;

    private LocalDateTime lastLoginAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum UserRole {
        BUYER, SELLER, ADMIN
    }

    public enum KycStatus {
        PENDING, SUBMITTED, VERIFIED, REJECTED
    }
}
