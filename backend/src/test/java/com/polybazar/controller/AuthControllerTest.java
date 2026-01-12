package com.polybazar.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polybazar.dto.AuthResponse;
import com.polybazar.dto.LoginRequest;
import com.polybazar.dto.RegisterRequest;
import com.polybazar.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController Integration Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setCompanyName("Test Company");
        registerRequest.setRole("BUYER");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        authResponse = new AuthResponse();
        authResponse.setAccessToken("accessToken123");
        authResponse.setRefreshToken("refreshToken123");
        authResponse.setExpiresIn(900);
        authResponse.setUserId(UUID.randomUUID().toString());
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("Should register user successfully")
        void shouldRegisterSuccessfully() throws Exception {
            // Given
            given(authService.register(any(RegisterRequest.class))).willReturn(authResponse);

            // When/Then
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("accessToken123"))
                .andExpect(jsonPath("$.refreshToken").value("refreshToken123"))
                .andExpect(jsonPath("$.expiresIn").value(900));
        }

        @Test
        @DisplayName("Should return 400 for invalid request")
        void shouldReturn400ForInvalidRequest() throws Exception {
            // Given
            registerRequest.setEmail("invalid-email");

            // When/Then
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 409 for duplicate email")
        void shouldReturn409ForDuplicateEmail() throws Exception {
            // Given
            given(authService.register(any(RegisterRequest.class)))
                .willThrow(new RuntimeException("Email already registered"));

            // When/Then
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginEndpoint {

        @Test
        @DisplayName("Should login successfully")
        void shouldLoginSuccessfully() throws Exception {
            // Given
            given(authService.login(any(LoginRequest.class))).willReturn(authResponse);

            // When/Then
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("accessToken123"))
                .andExpect(cookie().exists("refreshToken"));
        }

        @Test
        @DisplayName("Should return 401 for invalid credentials")
        void shouldReturn401ForInvalidCredentials() throws Exception {
            // Given
            given(authService.login(any(LoginRequest.class)))
                .willThrow(new BadCredentialsException("Invalid credentials"));

            // When/Then
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 400 for missing email")
        void shouldReturn400ForMissingEmail() throws Exception {
            // Given
            loginRequest.setEmail(null);

            // When/Then
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshEndpoint {

        @Test
        @DisplayName("Should refresh token successfully")
        void shouldRefreshTokenSuccessfully() throws Exception {
            // Given
            given(authService.refreshToken(anyString())).willReturn(authResponse);

            // When/Then
            mockMvc.perform(post("/api/auth/refresh")
                    .cookie(new jakarta.servlet.http.Cookie("refreshToken", "validRefreshToken")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("accessToken123"));
        }

        @Test
        @DisplayName("Should return 401 for missing refresh token")
        void shouldReturn401ForMissingToken() throws Exception {
            // When/Then
            mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 for expired refresh token")
        void shouldReturn401ForExpiredToken() throws Exception {
            // Given
            given(authService.refreshToken(anyString()))
                .willThrow(new RuntimeException("Refresh token expired"));

            // When/Then
            mockMvc.perform(post("/api/auth/refresh")
                    .cookie(new jakarta.servlet.http.Cookie("refreshToken", "expiredToken")))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    class LogoutEndpoint {

        @Test
        @DisplayName("Should logout successfully")
        void shouldLogoutSuccessfully() throws Exception {
            // Given
            willDoNothing().given(authService).logout(any(UUID.class));

            // When/Then
            mockMvc.perform(post("/api/auth/logout")
                    .header("Authorization", "Bearer validToken"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("refreshToken", 0));
        }
    }
}
