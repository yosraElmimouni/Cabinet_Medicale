package com.medical.file_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Nom original du fichier (ex: ordonnance.pdf)
    private String originalFileName;

    // Nom stocké physiquement (ex: 2fc0d9e2-..._ordonnance.pdf)
    private String storedFileName;

    private String fileType;   // MIME type (application/pdf, image/png...)
    private long fileSize;     // en bytes

    // Chemin complet ou relatif vers le fichier sur disque
    private String storagePath;

    private Long ownerId;

    @Enumerated(EnumType.STRING)
    private OwnerType ownerType;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}