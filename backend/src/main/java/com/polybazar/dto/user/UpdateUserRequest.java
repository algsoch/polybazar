package com.polybazar.dto.user;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String companyName;
    private String phone;
    private String profileImageUrl;
}
