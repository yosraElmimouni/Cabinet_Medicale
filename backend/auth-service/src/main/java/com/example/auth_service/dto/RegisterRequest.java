package com.example.auth_service.dto;

import com.example.auth_service.model.RoleUser;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String login;
    private String password;

    private String nom;
    private String prenom;
    private String numTel;
    private String email;

    private RoleUser role;   // SUPER_ADMIN, ADMIN_CABINET, MEDECIN, SECRETAIRE

    private Long cabinetId;  // NULL si SUPER_ADMIN
}
