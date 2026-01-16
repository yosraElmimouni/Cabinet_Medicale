package com.example.auth_service.mapper;

import com.example.auth_service.model.RoleUser;

public class OwnerTypeMapper {

    public static String map(RoleUser role) {
        return switch (role) {
            case MEDECIN -> "MEDECIN";
            case SECRETAIRE -> "SECRETAIRE";
            case ADMIN_CABINET -> "CABINET";
            case SUPER_ADMIN -> "ADMIN";
        };
    }
}
