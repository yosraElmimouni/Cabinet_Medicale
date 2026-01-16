package com.medical.file_service.dto;


import com.medical.file_service.model.OwnerType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FileResponse {

    private String id;
    private String originalFileName;
    private String fileType;
    private long fileSize;
    private String url;     // futur lien d'accès (ex: /files/{id})
    private Long ownerId;
    private OwnerType ownerType;
    private LocalDateTime createdAt;
}

