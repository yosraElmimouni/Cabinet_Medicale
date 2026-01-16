package com.medical.file_service.controller;


import com.medical.file_service.dto.FileResponse;
import com.medical.file_service.model.OwnerType;
import com.medical.file_service.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    // Upload d'un fichier
    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("ownerType") OwnerType ownerType
    ) throws IOException {

        FileResponse response = fileStorageService.uploadFile(file, ownerId, ownerType);
        return ResponseEntity.ok(response);
    }

    // Télécharger un fichier
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) throws IOException {

        FileResponse info = fileStorageService.getFileInfo(id);
        Resource resource = fileStorageService.downloadFile(id);

        String fileName = URLEncoder.encode(info.getOriginalFileName(), StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(info.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    // Infos d'un fichier
    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFileInfo(@PathVariable String id) {
        return ResponseEntity.ok(fileStorageService.getFileInfo(id));
    }

    // Liste des fichiers d'un owner
    @GetMapping
    public ResponseEntity<List<FileResponse>> listByOwner(
            @RequestParam Long ownerId,
            @RequestParam OwnerType ownerType
    ) {
        return ResponseEntity.ok(fileStorageService.listFilesByOwner(ownerId, ownerType));
    }

    // Suppression d'un fichier
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable String id) throws IOException {
        fileStorageService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
