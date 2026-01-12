package com.polybazar.service;

import com.polybazar.dto.LoginRequest;
import com.polybazar.dto.RegisterRequest;
import com.polybazar.dto.AuthResponse;
import com.polybazar.model.User;
import com.polybazar.model.RefreshToken;
import com.polybazar.repository.UserRepository;
import com.polybazar.repository.RefreshTokenRepository;
import com.polybazar.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setCompanyName("Test Company");
        testUser.setRole(User.Role.BUYER);

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("new@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setCompanyName("New Company");
        registerRequest.setRole("BUYER");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Nested
    @DisplayName("Register Tests")
    class RegisterTests {

        @Test
        @DisplayName("Should register new user successfully")
        void shouldRegisterNewUser() {
            // Given
            given(userRepository.existsByEmail(anyString())).willReturn(false);
            given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");
            given(userRepository.save(any(User.class))).willReturn(testUser);
            given(jwtTokenProvider.generateAccessToken(any(User.class))).willReturn("accessToken");
            given(jwtTokenProvider.generateRefreshToken(any(User.class))).willReturn("refreshToken");

            // When
            AuthResponse response = authService.register(registerRequest);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("accessToken");
            assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
            
            then(userRepository).should().save(any(User.class));
            then(refreshTokenRepository).should().save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            // Given
            given(userRepository.existsByEmail(anyString())).willReturn(true);

            // When/Then
            assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already registered");
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login user successfully")
        void shouldLoginSuccessfully() {
            // Given
            given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            given(userRepository.findByEmail(anyString())).willReturn(Optional.of(testUser));
            given(jwtTokenProvider.generateAccessToken(any(User.class))).willReturn("accessToken");
            given(jwtTokenProvider.generateRefreshToken(any(User.class))).willReturn("refreshToken");

            // When
            AuthResponse response = authService.login(loginRequest);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("accessToken");
            assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        }

        @Test
        @DisplayName("Should throw exception for invalid credentials")
        void shouldThrowExceptionForInvalidCredentials() {
            // Given
            given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willThrow(new BadCredentialsException("Invalid credentials"));

            // When/Then
            assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
        }
    }

    @Nested
    @DisplayName("Refresh Token Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token successfully")
        void shouldRefreshTokenSuccessfully() {
            // Given
            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setToken("validRefreshToken");
            refreshToken.setUser(testUser);
            refreshToken.setExpiresAt(Instant.now().plusSeconds(3600));

            given(refreshTokenRepository.findByToken(anyString())).willReturn(Optional.of(refreshToken));
            given(jwtTokenProvider.generateAccessToken(any(User.class))).willReturn("newAccessToken");
            given(jwtTokenProvider.generateRefreshToken(any(User.class))).willReturn("newRefreshToken");

            // When
            AuthResponse response = authService.refreshToken("validRefreshToken");

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("newAccessToken");
        }

        @Test
        @DisplayName("Should throw exception for expired refresh token")
        void shouldThrowExceptionForExpiredToken() {
            // Given
            RefreshToken expiredToken = new RefreshToken();
            expiredToken.setToken("expiredToken");
            expiredToken.setUser(testUser);
            expiredToken.setExpiresAt(Instant.now().minusSeconds(3600));

            given(refreshTokenRepository.findByToken(anyString())).willReturn(Optional.of(expiredToken));

            // When/Then
            assertThatThrownBy(() -> authService.refreshToken("expiredToken"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("expired");
        }

        @Test
        @DisplayName("Should throw exception for invalid refresh token")
        void shouldThrowExceptionForInvalidToken() {
            // Given
            given(refreshTokenRepository.findByToken(anyString())).willReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> authService.refreshToken("invalidToken"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid");
        }
    }

    @Nested
    @DisplayName("Logout Tests")
    class LogoutTests {

        @Test
        @DisplayName("Should logout user successfully")
        void shouldLogoutSuccessfully() {
            // Given
            willDoNothing().given(refreshTokenRepository).deleteByUserId(any(UUID.class));

            // When
            authService.logout(testUser.getId());

            // Then
            then(refreshTokenRepository).should().deleteByUserId(testUser.getId());
        }
    }
}
