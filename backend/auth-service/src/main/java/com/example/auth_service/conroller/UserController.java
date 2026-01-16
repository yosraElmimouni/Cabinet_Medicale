package com.example.auth_service.conroller;

import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.model.RoleUser;
import com.example.auth_service.security.JWTService;
import com.example.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;
    private final JWTService jwtService;

    @GetMapping("/{id}")
    public UserResponse getUsersById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        return userService.findById(id);
    }

    // 🔥 Vérification du cabinet et du rôle avec JWT
    private void checkAccess(String authHeader, Long requestedCabinetId, boolean allowListAccess) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token manquant");
        }

        String token = authHeader.substring(7);

        String role = jwtService.extractRole(token);
        Long tokenCabinet = jwtService.extractCabinetId(token);

        // SUPER ADMIN ne peut jamais accéder aux données des cabinets
        if (role.equals(RoleUser.SUPER_ADMIN.name())) {
            throw new RuntimeException("Accès interdit : Super Admin ne peut pas consulter les cabinets.");
        }

        // MEDECIN et SECRETAIRE ne peuvent pas accéder aux listes d’utilisateurs
        if (!role.equals(RoleUser.ADMIN_CABINET.name()) && allowListAccess) {
            throw new RuntimeException("Accès refusé : vous n'êtes pas administrateur du cabinet.");
        }

        // ADMIN_CABINET → ne peut accéder qu’à SON cabinet
        if (!tokenCabinet.equals(requestedCabinetId)) {
            throw new RuntimeException("Accès interdit : cabinet différent.");
        }
    }


    // ----------------------- LISTE DES UTILISATEURS -----------------------

    @GetMapping("/cabinet/{cabinetId}")
    public List<UserResponse> getUsersByCabinet(
            @PathVariable Long cabinetId,
            @RequestHeader("Authorization") String authHeader
    ) {
        checkAccess(authHeader, cabinetId, true);
        return userService.getUsersByCabinet(cabinetId);
    }

    @GetMapping("/cabinet/{cabinetId}/medecins")
    public List<UserResponse> getMedecinsByCabinet(
            @PathVariable Long cabinetId,
            @RequestHeader("Authorization") String authHeader
    ) {

        return userService.getMedecinsByCabinet(cabinetId);
    }

    @GetMapping("/cabinet/{cabinetId}/secretaires")
    public List<UserResponse> getSecretairesByCabinet(
            @PathVariable Long cabinetId,
            @RequestHeader("Authorization") String authHeader
    ) {
        checkAccess(authHeader, cabinetId, true);
        return userService.getSecretairesByCabinet(cabinetId);
    }

    // ----------------------- DELETE USER -----------------------

    @DeleteMapping("/{userId}")
    public void deleteUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);

        String role = jwtService.extractRole(token);
        Long tokenCabinet = jwtService.extractCabinetId(token);

        if (role.equals(RoleUser.SUPER_ADMIN.name())) {
            throw new RuntimeException("Super Admin ne peut pas supprimer dans les cabinets.");
        }

        if (!role.equals(RoleUser.ADMIN_CABINET.name())) {
            throw new RuntimeException("Accès refusé : seul l'admin du cabinet peut supprimer.");
        }

        Long userCabinet = userService.getCabinetByUserId(userId);

        if (!tokenCabinet.equals(userCabinet)) {
            throw new RuntimeException("Accès interdit : utilisateur d’un autre cabinet.");
        }

        userService.deleteUser(userId);
    }


}
