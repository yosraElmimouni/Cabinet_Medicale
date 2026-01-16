package com.exemple.patient_medical_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    private String id;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String url;
    private Long ownerId;
    private String ownerType; // Correspond à l'enum OwnerType du file-service
    private LocalDateTime uploadDate;
}
