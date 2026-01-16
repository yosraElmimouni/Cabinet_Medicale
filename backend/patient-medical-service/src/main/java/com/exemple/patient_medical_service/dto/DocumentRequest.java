package com.exemple.patient_medical_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class DocumentRequest {
    private Integer idDossier;
    private List<byte[]> fileContents;
    private List<String> fileNames;
    private String ownerType;
}
