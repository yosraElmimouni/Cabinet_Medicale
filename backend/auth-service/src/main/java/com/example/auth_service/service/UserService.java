package com.example.auth_service.service;

import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.mapper.UserMapper;
import com.example.auth_service.model.RoleUser;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public List<UserResponse> getUsersByCabinet(Long cabinetId) {
        return userRepository.findByCabinetId(cabinetId)
                .stream().map(userMapper::toResponse).toList();
    }

    public List<UserResponse> getMedecinsByCabinet(Long cabinetId) {
        return userRepository.findByCabinetIdAndRole(cabinetId, RoleUser.MEDECIN)
                .stream().map(userMapper::toResponse).toList();
    }

    public List<UserResponse> getSecretairesByCabinet(Long cabinetId) {
        return userRepository.findByCabinetIdAndRole(cabinetId, RoleUser.SECRETAIRE)
                .stream().map(userMapper::toResponse).toList();
    }

    public Long getCabinetByUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"))
                .getCabinetId();
    }


    public void deleteUser(Long userId) {
        if(!userRepository.existsById(userId)) {
            throw new RuntimeException("Utilisateur introuvable");
        }
        userRepository.deleteById(userId);
    }

    public UserResponse findById(Long userId){
        return userRepository.findById(userId)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
