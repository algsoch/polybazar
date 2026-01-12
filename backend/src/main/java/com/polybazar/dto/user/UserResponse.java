package com.polybazar.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String fullName;
    private String companyName;
    private String phone;
    private String role;
    private Boolean emailVerified;
    private Boolean kycVerified;
    private String profileImageUrl;
    private String createdAt;
    private String updatedAt;
}
