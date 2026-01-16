package com.example.auth_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;

    private Long userId;
    private Long cabinetId;

    private String nom;
    private String prenom;
    private String email;
    private String role; // option : RoleUser type
    private String imageId;
    private String signatureId;
}
