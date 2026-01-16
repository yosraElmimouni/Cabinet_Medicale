package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.FileResponse;
import com.exemple.patient_medical_service.model.DossierMedical;
import com.exemple.patient_medical_service.repository.DossierMedicalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentSyncService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final FileServiceClient fileServiceClient;


    public Mono<FileResponse> uploadAndSyncDocument(Integer idDossier, byte[] fileContent, String fileName, String ownerType) {
        // 1. Récupérer le dossier médical pour obtenir l'ID du patient
        return dossierMedicalRepository.findById(idDossier)
                .map(dossier -> {
                    Long patientId = dossier.getPatient().getIdPatient().longValue();
                    return new Object[]{dossier, patientId};
                })
                .map(result -> {
                    DossierMedical dossier = (DossierMedical) result[0];
                    Long patientId = (Long) result[1];
                    
                    // 2. Upload du fichier via le file-service
                    return fileServiceClient.uploadDocument(fileContent, fileName, patientId, ownerType)
                            .map(fileResponse -> {
                                // 3. Ajouter l'URL du document à la liste documentsMedicaux
                                String fileUrl = fileResponse.getUrl();
                                if (dossier.getDocumentsMedicaux() == null) {
                                    dossier.setDocumentsMedicaux(List.of(fileUrl));
                                } else {
                                    dossier.getDocumentsMedicaux().add(fileUrl);
                                }
                                
                                // 4. Sauvegarder le dossier médical mis à jour
                                dossierMedicalRepository.save(dossier);
                                log.info("Document {} ajouté au dossier médical {}", fileResponse.getId(), idDossier);
                                
                                return fileResponse;
                            });
                })
                .orElse(Mono.error(new RuntimeException("Dossier médical non trouvé avec l'ID: " + idDossier)));
    }

    /**
     * Supprime un document du dossier médical
     * @param idDossier L'ID du dossier médical
     * @param fileId L'ID du fichier à supprimer
     * @return Mono vide
     */
    public Mono<Void> deleteDocumentFromDossier(Integer idDossier, String fileId) {
        // 1. Récupérer le dossier médical
        return dossierMedicalRepository.findById(idDossier)
                .map(dossier -> {
                    // 2. Supprimer l'URL du document de la liste documentsMedicaux
                    if (dossier.getDocumentsMedicaux() != null) {
                        String fileUrl = "/files/" + fileId;
                        dossier.getDocumentsMedicaux().remove(fileUrl);
                        dossierMedicalRepository.save(dossier);
                        log.info("Document {} supprimé du dossier médical {}", fileId, idDossier);
                    }
                    
                    // 3. Supprimer le fichier via le file-service
                    return fileServiceClient.deleteDocument(fileId);
                })
                .orElse(Mono.error(new RuntimeException("Dossier médical non trouvé avec l'ID: " + idDossier)));
    }

    /**
     * Récupère tous les documents du dossier médical (fusionne les URLs locales et les appels au file-service)
     * @param idDossier L'ID du dossier médical
     * @return Une liste de FileResponse
     */
    public Mono<List<FileResponse>> getAllDocumentsForDossier(Integer idDossier) {
        // 1. Récupérer le dossier médical
        return dossierMedicalRepository.findById(idDossier)
                .map(dossier -> {
                    Long patientId = dossier.getPatient().getIdPatient().longValue();
                    
                    // 2. Récupérer les documents via le file-service
                    return fileServiceClient.listDocumentsByOwner(patientId, "PATIENT");
                })
                .orElse(Mono.error(new RuntimeException("Dossier médical non trouvé avec l'ID: " + idDossier)));
    }

    /**
     * Récupère tous les documents associés à un patient spécifique
     * @param idPatient L'ID du patient
     * @return Une liste de FileResponse
     */
    public Mono<List<FileResponse>> getAllDocumentsForPatient(Integer idPatient) {
        log.info("Récupération de tous les documents pour le patient ID: {}", idPatient);
        return fileServiceClient.listDocumentsByOwner(idPatient.longValue(), "PATIENT");
    }

    /**
     * Upload un document pour un médecin spécifique
     */
    public Mono<FileResponse> uploadDocumentForMedecin(Integer idMedecin, byte[] fileContent, String fileName) {
        log.info("Upload d'un document pour le médecin ID: {}", idMedecin);
        return fileServiceClient.uploadDocument(fileContent, fileName, idMedecin.longValue(), "MEDECIN");
    }

    /**
     * Récupère tous les documents d'un médecin spécifique
     */
    public Mono<List<FileResponse>> getAllDocumentsForMedecin(Integer idMedecin) {
        log.info("Récupération des documents pour le médecin ID: {}", idMedecin);
        return fileServiceClient.listDocumentsByOwner(idMedecin.longValue(), "MEDECIN");
    }

    /**
     * Récupère les informations d'un document spécifique
     * @param fileId L'ID du fichier
     * @return Le FileResponse du fichier
     */
    public Mono<FileResponse> getDocumentById(String fileId) {
        return fileServiceClient.getDocumentById(fileId);
    }

    /**
     * Télécharge le contenu binaire d'un document
     * @param fileId L'ID du fichier
     * @return Le contenu binaire du fichier
     */
    public Mono<byte[]> downloadDocument(String fileId) {
        return fileServiceClient.downloadDocument(fileId)
                .flatMap(resource -> {
                    try {
                        return Mono.just(resource.getInputStream().readAllBytes());
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Erreur lors du téléchargement du document", e));
                    }
                });
    }
}
