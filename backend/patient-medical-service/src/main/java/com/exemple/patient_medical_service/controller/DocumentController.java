package com.exemple.patient_medical_service.controller;

import com.exemple.patient_medical_service.dto.FileResponse;
import com.exemple.patient_medical_service.service.DocumentSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/DossierMedical/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentSyncService documentSyncService;

    @PostMapping(value = "/{idDossier}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<FileResponse> uploadDocument(@PathVariable Integer idDossier,
                                             @RequestParam("file") MultipartFile file,
                                             @RequestParam(value = "ownerType", defaultValue = "PATIENT") String ownerType) {
        try {
            byte[] fileContent = file.getBytes();
            String fileName = file.getOriginalFilename();
            
            return documentSyncService.uploadAndSyncDocument(idDossier, fileContent, fileName, ownerType);
        } catch (Exception e) {
            return Mono.error(new RuntimeException("Erreur lors de l'upload du document", e));
        }
    }

    /**
     * Upload plusieurs documents en une seule requête
     * @param idDossier L'ID du dossier médical
     * @param files Les fichiers à upload
     * @param ownerType Le type de propriétaire
     * @return Une liste de FileResponse
     */
    @PostMapping(value = "/{idDossier}/list", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<List<FileResponse>> uploadDocuments(@PathVariable Integer idDossier,
                                                   @RequestParam("files") List<MultipartFile> files,
                                                   @RequestParam(value = "ownerType", defaultValue = "PATIENT") String ownerType) {
        try {
            List<Mono<?>> uploadOperations = files.stream()
                    .map(file -> {
                        try {
                            byte[] content = file.getBytes();
                            String name = file.getOriginalFilename();
                            return documentSyncService.uploadAndSyncDocument(idDossier, content, name, ownerType);
                        } catch (Exception e) {
                            return Mono.error(e);
                        }
                    })
                    .collect(Collectors.toList());

            return Mono.zip(uploadOperations, responses -> {
                FileResponse[] responseArray = new FileResponse[responses.length];
                for (int i = 0; i < responses.length; i++) {
                    responseArray[i] = (FileResponse) responses[i];
                }
                return List.of(responseArray);
            });
        } catch (Exception e) {
            return Mono.error(new RuntimeException("Erreur lors de l'upload des documents", e));
        }
    }

    /**
     * Récupère tous les documents associés à un dossier médical
     * @param idDossier L'ID du dossier médical
     * @return Une liste de FileResponse
     */
    @GetMapping("/{idDossier}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<List<FileResponse>> getDocuments(@PathVariable Integer idDossier) {
        return documentSyncService.getAllDocumentsForDossier(idDossier);
    }

    /**
     * Récupère tous les documents associés à un patient
     * @param idPatient L'ID du patient
     * @return Une liste de FileResponse
     */
    @GetMapping("/patient/{idPatient}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<List<FileResponse>> getPatientDocuments(@PathVariable Integer idPatient) {
        return documentSyncService.getAllDocumentsForPatient(idPatient);
    }

    /**
     * Upload un document pour un médecin
     */
    @PostMapping(value = "/medecin/{idMedecin}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<FileResponse> uploadMedecinDocument(@PathVariable Integer idMedecin,
                                                   @RequestParam("file") MultipartFile file) {
        try {
            return documentSyncService.uploadDocumentForMedecin(idMedecin, file.getBytes(), file.getOriginalFilename());
        } catch (Exception e) {
            return Mono.error(new RuntimeException("Erreur lors de l'upload du document médecin", e));
        }
    }

    /**
     * Récupère tous les documents d'un médecin
     */
    @GetMapping("/medecin/{idMedecin}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<List<FileResponse>> getMedecinDocuments(@PathVariable Integer idMedecin) {
        return documentSyncService.getAllDocumentsForMedecin(idMedecin);
    }

    /**
     * Supprime un document du dossier médical
     * @param idDossier L'ID du dossier médical
     * @param fileId L'ID du fichier à supprimer
     * @return Mono vide
     */
    @DeleteMapping("/{idDossier}/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteDocument(@PathVariable Integer idDossier, @PathVariable String fileId) {
        return documentSyncService.deleteDocumentFromDossier(idDossier, fileId);
    }

    /**
     * Télécharge un document
     * @param fileId L'ID du fichier
     * @return Le contenu binaire du fichier
     */
    @GetMapping("/download/{fileId}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<byte[]> downloadDocument(@PathVariable String fileId) {
        return documentSyncService.downloadDocument(fileId);
    }
}
