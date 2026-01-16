package com.example.auth_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String login;

    @Column(nullable = false)
    private String password;

    private String nom;
    private String prenom;

    private String numTel;
    private String email;

    private String imageId;        // URL retournée par file-com.example.auth_service.service
    private String signatureId;    // URL ou chemin

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleUser role;

    private Long cabinetId;  // null = super admin
}
