package com.polybazar.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    private String phoneNumber; // Alias for compatibility
    
    public String getPhoneNumber() {
        return phoneNumber != null ? phoneNumber : phone;
    }
    
    private String companyName;
    
    private String role; // BUYER or SELLER
}
