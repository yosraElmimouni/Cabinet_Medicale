package com.example.auth_service.service;

import com.example.auth_service.client.FileClient;
import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.FileResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.mapper.OwnerTypeMapper;
import com.example.auth_service.model.RoleUser;
import com.example.auth_service.model.User;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.security.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final FileClient fileClient;

    public AuthResponse register(RegisterRequest request,
                                 MultipartFile image,
                                 MultipartFile signature) {

        if (userRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("Ce login est déjà utilisé");
        }

        if (request.getRole() == RoleUser.SUPER_ADMIN) {
            request.setCabinetId(null);
        }

        User user = User.builder()
                .login(request.getLogin())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .numTel(request.getNumTel())
                .email(request.getEmail())
                .role(request.getRole())
                .cabinetId(request.getCabinetId())
                .build();

        userRepository.save(user);

        String ownerType = OwnerTypeMapper.map(request.getRole());

        // Vérifier les fichiers avant l’upload
        FileResponse img = null;
        FileResponse sig = null;

        // Photo de profil
        if (image != null && !image.isEmpty()) {
            img = fileClient.uploadFile(image, user.getId(), ownerType);
            user.setImageId(img != null ? img.getId() : null);
        }

        // Signature (uniquement si le rôle le nécessite)
        if (signature != null && !signature.isEmpty() && request.getRole() == RoleUser.MEDECIN) {
            sig = fileClient.uploadFile(signature, user.getId(), ownerType);
            user.setSignatureId(sig != null ? sig.getId() : null);
        }


        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .cabinetId(user.getCabinetId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .imageId(user.getImageId())
                .signatureId(user.getSignatureId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .cabinetId(user.getCabinetId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
