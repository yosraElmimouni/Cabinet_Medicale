package com.example.auth_service.dto;

import lombok.Data;

@Data
public class FileResponse {

    private String id;
    private String originalFileName;
    private String fileType;
    private long size;
    private Long ownerId;
    private String ownerType;
}
