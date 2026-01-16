package com.medical.file_service.service;

import com.medical.file_service.dto.FileResponse;
import com.medical.file_service.exception.FileNotFoundException;
import com.medical.file_service.model.FileDocument;
import com.medical.file_service.model.OwnerType;
import com.medical.file_service.repository.FileDocumentRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @InjectMocks
    private FileStorageService fileStorageService;

    @Mock
    private FileDocumentRepository repository;

    private Path tempDir;

    @BeforeEach
    void setup() throws IOException {
        tempDir = Files.createTempDirectory("file-service-test");
        ReflectionTestUtils.setField(
                fileStorageService,
                "storageLocation",
                tempDir.toString()
        );
    }

    @AfterEach
    void cleanup() throws IOException {
        Files.walk(tempDir)
                .map(Path::toFile)
                .forEach(java.io.File::delete);
    }

    @Test
    @DisplayName("Upload fichier avec succès")
    void uploadFile_success() throws IOException {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                "content".getBytes()
        );

        when(repository.save(any(FileDocument.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FileResponse response = fileStorageService.uploadFile(
                file,
                1L,
                OwnerType.MEDECIN
        );

        assertNotNull(response);
        assertEquals("test.png", response.getOriginalFileName());
        assertEquals(1L, response.getOwnerId());
        verify(repository).save(any(FileDocument.class));
    }

    @Test
    @DisplayName("Erreur si fichier vide")
    void uploadFile_emptyFile() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                new byte[0]
        );

        assertThrows(RuntimeException.class, () ->
                fileStorageService.uploadFile(file, 1L, OwnerType.MEDECIN)
        );
    }

    @Test
    @DisplayName("Téléchargement fichier existant")
    void downloadFile_success() throws IOException {

        Path filePath = tempDir.resolve("file.txt");
        Files.write(filePath, "hello".getBytes());

        FileDocument doc = FileDocument.builder()
                .id("1")
                .storagePath(filePath.toString())
                .build();

        when(repository.findById("1"))
                .thenReturn(Optional.of(doc));

        Resource resource = fileStorageService.downloadFile("1");

        assertNotNull(resource);
        assertEquals(5, resource.contentLength());
    }

    @Test
    @DisplayName("Erreur si fichier introuvable")
    void downloadFile_notFound() {

        when(repository.findById("1"))
                .thenReturn(Optional.empty());

        assertThrows(FileNotFoundException.class, () ->
                fileStorageService.downloadFile("1")
        );
    }

    @Test
    @DisplayName("Suppression fichier existant")
    void deleteFile_success() throws IOException {

        Path filePath = tempDir.resolve("file.txt");
        Files.write(filePath, "data".getBytes());

        FileDocument doc = FileDocument.builder()
                .id("1")
                .storagePath(filePath.toString())
                .build();

        when(repository.findById("1"))
                .thenReturn(Optional.of(doc));

        fileStorageService.deleteFile("1");

        assertFalse(Files.exists(filePath));
        verify(repository).delete(doc);
    }

    @Test
    @DisplayName("Lister fichiers par propriétaire")
    void listFilesByOwner() {

        FileDocument doc = FileDocument.builder()
                .id("1")
                .ownerId(1L)
                .ownerType(OwnerType.MEDECIN)
                .build();

        when(repository.findByOwnerIdAndOwnerType(1L, OwnerType.MEDECIN))
                .thenReturn(List.of(doc));

        List<FileResponse> files =
                fileStorageService.listFilesByOwner(1L, OwnerType.MEDECIN);

        assertEquals(1, files.size());
    }

    @Test
    @DisplayName("Erreur si info fichier introuvable")
    void getFileInfo_notFound() {

        when(repository.findById("1"))
                .thenReturn(Optional.empty());

        assertThrows(FileNotFoundException.class, () ->
                fileStorageService.getFileInfo("1")
        );
    }
}