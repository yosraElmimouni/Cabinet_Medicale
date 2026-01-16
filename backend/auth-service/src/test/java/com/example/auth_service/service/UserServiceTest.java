package com.example.auth_service.service;

import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.mapper.UserMapper;
import com.example.auth_service.model.RoleUser;
import com.example.auth_service.model.User;
import com.example.auth_service.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    // getUsersByCabinet(liste retournée)
    @Test
    @DisplayName("Récupérer tous les utilisateurs d’un cabinet")
    void get_users_by_cabinet() {

        User user = User.builder()
                .id(1L)
                .cabinetId(10L)
                .role(RoleUser.MEDECIN)
                .build();

        UserResponse response = new UserResponse();

        when(userRepository.findByCabinetId(10L))
                .thenReturn(List.of(user));

        when(userMapper.toResponse(user))
                .thenReturn(response);

        List<UserResponse> result = userService.getUsersByCabinet(10L);

        assertEquals(1, result.size());
        verify(userRepository).findByCabinetId(10L);
    }

    // getMedecinsByCabinet(filtrage MEDECIN)
    @Test
    @DisplayName("Récupérer les médecins d’un cabinet")
    void get_medecins_by_cabinet() {

        User medecin = User.builder()
                .id(2L)
                .cabinetId(10L)
                .role(RoleUser.MEDECIN)
                .build();

        when(userRepository.findByCabinetIdAndRole(10L, RoleUser.MEDECIN))
                .thenReturn(List.of(medecin));

        when(userMapper.toResponse(medecin))
                .thenReturn(new UserResponse());

        List<UserResponse> result = userService.getMedecinsByCabinet(10L);

        assertEquals(1, result.size());
        verify(userRepository).findByCabinetIdAndRole(10L, RoleUser.MEDECIN);
    }

    // getSecretairesByCabinet(filtrage SECRETAIRE)
    @Test
    @DisplayName("Récupérer les secrétaires d’un cabinet")
    void get_secretaires_by_cabinet() {

        User secretaire = User.builder()
                .id(3L)
                .cabinetId(10L)
                .role(RoleUser.SECRETAIRE)
                .build();

        when(userRepository.findByCabinetIdAndRole(10L, RoleUser.SECRETAIRE))
                .thenReturn(List.of(secretaire));

        when(userMapper.toResponse(secretaire))
                .thenReturn(new UserResponse());

        List<UserResponse> result = userService.getSecretairesByCabinet(10L);

        assertEquals(1, result.size());
        verify(userRepository).findByCabinetIdAndRole(10L, RoleUser.SECRETAIRE);
    }

    // getCabinetByUserId OK
    @Test
    @DisplayName("Récupérer le cabinet d’un utilisateur")
    void get_cabinet_by_user_id_success() {

        User user = User.builder()
                .id(1L)
                .cabinetId(20L)
                .build();

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        Long cabinetId = userService.getCabinetByUserId(1L);

        assertEquals(20L, cabinetId);
    }

    // getCabinetByUserId NOT FOUND
    @Test
    @DisplayName("Erreur si utilisateur introuvable")
    void get_cabinet_by_user_id_not_found() {

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> userService.getCabinetByUserId(99L));
    }

    // deleteUser OK
    @Test
    @DisplayName("Suppression d’un utilisateur existant")
    void delete_user_success() {

        when(userRepository.existsById(1L))
                .thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    // deleteUser NOT FOUND
    @Test
    @DisplayName("Erreur si suppression utilisateur introuvable")
    void delete_user_not_found() {

        when(userRepository.existsById(2L))
                .thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> userService.deleteUser(2L));
    }
}
