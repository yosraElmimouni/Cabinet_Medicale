package com.exemple.patient_medical_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentResponse {
    private String id;
    private String originalFileName;
    private String fileType;
    private long fileSize;
    private String url;
    private Long ownerId;
    private String ownerType;
    private LocalDateTime createdAt;
}
