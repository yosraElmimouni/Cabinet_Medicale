package com.example.auth_service.mapper;

import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .numTel(user.getNumTel())
                .role(user.getRole())
                .imageId(user.getImageId())
                .signatureId(user.getSignatureId())
                .cabinetId(user.getCabinetId())
                .build();
    }
}
