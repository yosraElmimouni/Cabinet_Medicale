package com.example.auth_service.dto;

import com.example.auth_service.model.RoleUser;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String numTel;
    private RoleUser role;
    private String imageId;
    private String signatureId;
    private Long cabinetId;
}
