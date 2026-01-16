package com.example.cabinet_service.controller;


import com.example.cabinet_service.dto.CabinetRequest;
import com.example.cabinet_service.dto.CabinetResponse;
import com.example.cabinet_service.dto.CreateCabinetRequest;
import com.example.cabinet_service.model.Cabinet;
import com.example.cabinet_service.repository.CabinetRepository;
import com.example.cabinet_service.security.JWTService;
import com.example.cabinet_service.service.CabinetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cabinet")
@RequiredArgsConstructor
public class CabinetController {

    private final CabinetService cabinetService;
    private final JWTService jwtService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createCabinet(
            @RequestBody CreateCabinetRequest cabinetRequest,
            @RequestHeader("Authorization") String authHeader
    ){
        checkSuperAdmin(authHeader);
        cabinetService.createCabinet(cabinetRequest);
    }


    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<CabinetResponse> getAllCabinet(){
        return cabinetService.getAllCabinet();
    }

    private void checkSuperAdmin(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token manquant");
        }

        String token = authHeader.substring(7);
        String role = jwtService.extractRole(token);

        if (!role.equals("SUPER_ADMIN")) {
            throw new RuntimeException("Accès interdit : seul le Super Admin peut créer un cabinet.");
        }
    }

    @PutMapping("/{cabinetId}")
    public ResponseEntity<CabinetResponse> updateCabinet(
            @PathVariable Integer cabinetId,
            @RequestPart(required = false) MultipartFile logo,
            @RequestPart CabinetRequest request,
            @RequestHeader("Authorization") String token
    ) {

        // Vérifier que l'utilisateur est admin du cabinet
        jwtService.verifyCabinetAdmin(token, cabinetId);

        return ResponseEntity.ok(cabinetService.updateCabinet(cabinetId, request, logo));
    }

}


