package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.ConsultationRequest;
import com.exemple.patient_medical_service.dto.ConsultationResponse;
import com.exemple.patient_medical_service.dto.RendezVousConsultation;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.DossierMedical;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import com.exemple.patient_medical_service.repository.DossierMedicalRepository;
import com.exemple.patient_medical_service.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final WebClient.Builder webClientBuilder;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public void createConsultation(ConsultationRequest consultationRequest){

        // 1️⃣ Vérifier id rendez-vous
        Integer idRV = consultationRequest.getIdRendezVous();
        if (idRV == null) {
            throw new IllegalArgumentException("L'id du rendez-vous est obligatoire !");
        }

        // 2️⃣ Vérifier si le rendez-vous est terminé + récupérer idPatient
        RendezVousConsultation result = webClientBuilder.build()
                .get()
                .uri("http://RENDEZVOUS/api/RendezVous/termineMedcin",
                        uriBuilder -> uriBuilder.queryParam("idRV", idRV).build())
                .retrieve()
                .bodyToMono(RendezVousConsultation.class)
                .block();

        if (result == null) {
            throw new IllegalArgumentException("Rendez-vous introuvable !");
        }

        if (!result.isTerminate()) {
            throw new IllegalArgumentException("Rendez-vous non encore terminé, veuillez attendre");
        }

        Integer idPatient = result.getIdPatient();
        if (idPatient == null) {
            throw new IllegalArgumentException("Patient introuvable pour ce rendez-vous");
        }

        // 3️⃣ Vérifier si le dossier médical existe déjà
        DossierMedical dossierMedical =
                dossierMedicalRepository.findByPatientId(idPatient).orElse(null);

        // 4️⃣ S'il n'existe pas → le créer automatiquement
        if (dossierMedical == null) {

            Patient patient = patientRepository.findById(idPatient)
                    .orElseThrow(() -> new IllegalArgumentException("Patient inexistant"));

            dossierMedical = DossierMedical.builder()
                    .dateCreation(LocalDate.now().atStartOfDay())
                    .patient(patient)
                    .idMedecin(consultationRequest.getIdMedecin())
                    .build();

            dossierMedicalRepository.save(dossierMedical);
            log.info("Dossier médical créé automatiquement pour patient {}", idPatient);
        }

        // 5️⃣ Créer la consultation avec le dossier médical
        Consultation consultation = Consultation.builder()
                .dateConsultation(consultationRequest.getDateConsultation())
                .diagnostic(consultationRequest.getDiagnostic())
                .examenClinique(consultationRequest.getExamenClinique())
                .examenSupplementaire(consultationRequest.getExamenSupplementaire())
                .facture(consultationRequest.getFacture())
                .type(consultationRequest.getType())
                .observations(consultationRequest.getObservations())
                .traitement(consultationRequest.getTraitement())
                .idMedecin(consultationRequest.getIdMedecin())
                .idRendezVous(idRV)
                .dossierMedical(dossierMedical)
                .build();

        consultationRepository.save(consultation);

        log.info("Consultation {} sauvegardée avec dossier médical {}",
                consultation.getIdConsultation(),
                dossierMedical.getIdDossier());
    }


    public List<ConsultationResponse> getAllConsultation(){
        List<Consultation> consultations = consultationRepository.findAll();
        return consultations.stream().map(consultation -> mapToConsultationResponse(consultation)).toList();
    }

    public List<ConsultationResponse> getAllConsultationMedcin(Integer id){
        List<Consultation> consultations = consultationRepository.findByIdMedecin(id);
        return consultations.stream().map(consultation -> mapToConsultationResponse(consultation)).toList();
    }

    private ConsultationResponse mapToConsultationResponse(Consultation consultation) {
        return ConsultationResponse.builder()
                .idConsultation(consultation.getIdConsultation())
                .dateConsultation(consultation.getDateConsultation())
                .diagnostic(consultation.getDiagnostic())
                .dossierMedical(consultation.getDossierMedical())
                .examenClinique(consultation.getExamenClinique())
                .examenSupplementaire(consultation.getExamenSupplementaire())
                .facture(consultation.getFacture())
                .type(consultation.getType())
                .observations(consultation.getObservations())
                .traitement(consultation.getTraitement())
                .idMedecin(consultation.getIdMedecin())
                .build();
    }
}

