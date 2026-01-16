package com.example.auth_service.service;

import com.example.auth_service.client.FileClient;
import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.model.RoleUser;
import com.example.auth_service.model.User;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.security.JWTService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTService jwtService;

    @Mock
    private FileClient fileClient;

    //Login OK (cas simple)
    @Test
    @DisplayName("Login réussi avec credentials valides")
    void login_success() {

        // Arrange
        LoginRequest request = new LoginRequest("admin", "1234");

        User user = User.builder()
                .id(1L)
                .login("admin")
                .password("encoded")
                .role(RoleUser.ADMIN_CABINET)
                .build();

        when(userRepository.findByLogin("admin"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("1234", "encoded"))
                .thenReturn(true);

        when(jwtService.generateToken(user))
                .thenReturn("fake-jwt");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("fake-jwt", response.getToken());
        assertEquals(1L, response.getUserId());
    }


    //Login avec mauvais mot de passe
    @Test
    @DisplayName("Login échoue si mot de passe incorrect")
    void login_wrong_password() {

        LoginRequest request = new LoginRequest("admin", "wrong");

        User user = User.builder()
                .login("admin")
                .password("encoded")
                .build();

        when(userRepository.findByLogin("admin"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("wrong", "encoded"))
                .thenReturn(false);

        // Act + Assert
        assertThrows(RuntimeException.class,
                () -> authService.login(request));
    }

    //Register échoue si login déjà utilisé
    @Test
    @DisplayName("Register échoue si login déjà existant")
    void register_login_already_exists() {

        RegisterRequest request = RegisterRequest.builder()
                .login("admin")
                .build();

        when(userRepository.existsByLogin("admin"))
                .thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> authService.register(request, null, null));
    }


}
