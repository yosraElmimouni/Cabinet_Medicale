package com.medical.file_service.service;


import com.medical.file_service.dto.FileResponse;
import com.medical.file_service.exception.FileNotFoundException;
import com.medical.file_service.model.FileDocument;
import com.medical.file_service.model.OwnerType;
import com.medical.file_service.repository.FileDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileDocumentRepository repository;

    @Value("${file.storage.location}")
    private String storageLocation;

    private Path getStoragePath() throws IOException {
        Path path = Paths.get(storageLocation).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        return path;
    }

    public FileResponse uploadFile(MultipartFile file, Long ownerId, OwnerType ownerType) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("Fichier vide");
        }

        String originalFileName = file.getOriginalFilename();
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;

        Path storagePath = getStoragePath().resolve(storedFileName);

        // Copie du fichier sur disque
        Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);

        FileDocument doc = FileDocument.builder()
                .originalFileName(originalFileName)
                .storedFileName(storedFileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(storagePath.toString())
                .ownerId(ownerId)
                .ownerType(ownerType)
                .build();

        doc = repository.save(doc);

        return toResponse(doc);
    }

    public Resource downloadFile(String id) throws IOException {
        FileDocument doc = repository.findById(id)
                .orElseThrow(() -> new FileNotFoundException("Fichier introuvable"));

        Path path = Paths.get(doc.getStoragePath());
        if (!Files.exists(path)) {
            throw new FileNotFoundException("Fichier physique introuvable");
        }

        byte[] data = Files.readAllBytes(path);
        return new ByteArrayResource(data);
    }

    public void deleteFile(String id) throws IOException {
        FileDocument doc = repository.findById(id)
                .orElseThrow(() -> new FileNotFoundException("Fichier introuvable"));

        Path path = Paths.get(doc.getStoragePath());
        if (Files.exists(path)) {
            Files.delete(path);
        }

        repository.delete(doc);
    }

    public List<FileResponse> listFilesByOwner(Long ownerId, OwnerType ownerType) {
        return repository.findByOwnerIdAndOwnerType(ownerId, ownerType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FileResponse getFileInfo(String id) {
        FileDocument doc = repository.findById(id)
                .orElseThrow(() -> new FileNotFoundException("Fichier introuvable"));
        return toResponse(doc);
    }

    private FileResponse toResponse(FileDocument doc) {
        return FileResponse.builder()
                .id(doc.getId())
                .originalFileName(doc.getOriginalFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .url("/files/" + doc.getId())
                .ownerId(doc.getOwnerId())
                .ownerType(doc.getOwnerType())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
