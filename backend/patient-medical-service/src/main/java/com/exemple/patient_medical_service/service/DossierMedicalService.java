package com.exemple.patient_medical_service.service;


import com.exemple.patient_medical_service.dto.DossierMedicalRequest;
import com.exemple.patient_medical_service.dto.DossierMedicalResponse;
import com.exemple.patient_medical_service.dto.ListeConsultationDossierMedicale;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import com.exemple.patient_medical_service.repository.PatientRepository;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.DossierMedical;
import com.exemple.patient_medical_service.repository.DossierMedicalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.exemple.patient_medical_service.dto.FileResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Optional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;//
    private final WebClient.Builder webClientBuilder;
    private final FileServiceClient fileServiceClient; // Ajout du client pour le file-service
    private final PatientService patientService; // Ajout du service patient pour vérifier l'existence du patient
    private  final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;

    public void createDossierMedical(DossierMedicalRequest dossierMedicalRequest){
        Patient patient = patientRepository.findById(dossierMedicalRequest.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient introuvable"));

        DossierMedical dossierMedical = DossierMedical.builder()
                .dateCreation(dossierMedicalRequest.getDateCreation())
                .allergies(dossierMedicalRequest.getAllergies())
                .antChirurg(dossierMedicalRequest.getAntChirurg())
                .antMedicaux(dossierMedicalRequest.getAntMedicaux())
                .consultations(dossierMedicalRequest.getConsultations())
                .documentsMedicaux(dossierMedicalRequest.getDocumentsMedicaux())
                .habitudes(dossierMedicalRequest.getHabitudes())
                .patient(patient)
                .traitementEnCour(dossierMedicalRequest.getTraitementEnCour())
                .idMedecin(dossierMedicalRequest.getIdMedecin())
                .build();
        dossierMedicalRepository.save(dossierMedical);
        log.info("dossierMedical  "+dossierMedical.getIdDossier() +" saved");
    }

    public List<DossierMedicalResponse> getAllDossierMedical(){
        List<DossierMedical> dossierMedicals = dossierMedicalRepository.findAll();
        return dossierMedicals.stream().map(dossierMedical -> mapToDossierMedicalResponse(dossierMedical)).toList();
    }

    private DossierMedicalResponse mapToDossierMedicalResponse(DossierMedical dossierMedical) {
        return DossierMedicalResponse.builder()
                .idDossier(dossierMedical.getIdDossier())
                .dateCreation(dossierMedical.getDateCreation())
                .allergies(dossierMedical.getAllergies())
                .antChirurg(dossierMedical.getAntChirurg())
                .antMedicaux(dossierMedical.getAntMedicaux())
                .consultations(dossierMedical.getConsultations())
                .documentsMedicaux(dossierMedical.getDocumentsMedicaux())
                .habitudes(dossierMedical.getHabitudes())
                .patient(dossierMedical.getPatient())
                .traitementEnCour(dossierMedical.getTraitementEnCour())
                .idMedecin(dossierMedical.getIdMedecin())
                .build();
    }

    public ListeConsultationDossierMedicale getConsultationsParidDM(Integer idDM){
        List<Consultation> consultations=consultationRepository.findByDossierMedical_IdDossier(idDM);

        return ListeConsultationDossierMedicale.builder()
                .idDossier(idDM)
                .consultationResponsesListe(consultations)
                .patient(dossierMedicalRepository.findById(idDM).get().getPatient())
                .build();
    }



    public ListeConsultationDossierMedicale getConsultationsParidPaatient(Integer idPatient) {

        DossierMedical dossierMedical = dossierMedicalRepository
                .findByPatient_IdPatient(idPatient)
                .orElseThrow(() ->
                        new RuntimeException("Aucun dossier médical trouvé pour le patient " + idPatient)
                );

        Integer idDM = dossierMedical.getIdDossier();

        List<Consultation> consultations =
                consultationRepository.findByDossierMedical_IdDossier(idDM);

        return ListeConsultationDossierMedicale.builder()
                .idDossier(idDM)
                .consultationResponsesListe(consultations)
                .patient(dossierMedical.getPatient())
                .build();
    }

    public ListeConsultationDossierMedicale getConsultationsParidMedcin(Integer idM) {

        DossierMedical dossierMedical = dossierMedicalRepository
                .findByIdMedecin(idM)
                .orElseThrow(() ->
                        new RuntimeException("Aucun dossier médical trouvé pour le idM " + idM)
                );

        Integer idDM = dossierMedical.getIdDossier();

        List<Consultation> consultations =
                consultationRepository.findByDossierMedical_IdDossier(idDM);

        return ListeConsultationDossierMedicale.builder()
                .idDossier(idDM)
                .consultationResponsesListe(consultations)
                .patient(dossierMedical.getPatient())
                .build();
    }



    public Mono<FileResponse> uploadDocumentForPatient(MultipartFile file, Long patientId) throws IOException {
        byte[] fileContent = file.getBytes();
        String fileName = file.getOriginalFilename();
        String ownerType = "PATIENT"; // Type d'owner pour les documents médicaux

        // 3. Appeler le file-service
        return fileServiceClient.uploadDocument(fileContent, fileName, patientId, ownerType);
    }

    public Mono<List<FileResponse>> getDocumentsForDossier(Integer idDossier) {
        Optional<DossierMedical> optionalDossier = dossierMedicalRepository.findById(idDossier);

        if (optionalDossier.isEmpty()) {
            return Mono.error(new RuntimeException("Dossier Medical non trouvé avec l'ID: " + idDossier));
        }

        // On suppose que les documents sont liés au Patient
        Long patientId = optionalDossier.get().getPatient().getIdPatient().longValue();

        // Appel au file-service pour lister les documents du patient
        return fileServiceClient.listDocumentsByOwner(patientId, "PATIENT");
    }

}

