package com.example.cabinet_service.dto;

import lombok.Data;

@Data
public class FileResponse {

    private String id;
    private String originalFileName;
    private String fileType;
    private long fileSize;
    private String url;
    private Long ownerId;
    private String ownerType;
    private String createdAt;
}
