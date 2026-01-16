package com.medical.file_service.repository;

import com.medical.file_service.model.FileDocument;
import com.medical.file_service.model.OwnerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileDocumentRepository extends JpaRepository<FileDocument, String> {

    List<FileDocument> findByOwnerIdAndOwnerType(Long ownerId, OwnerType ownerType);
}
