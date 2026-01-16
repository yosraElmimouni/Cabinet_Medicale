package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.*;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.repository.PatientRepository;
import com.sun.tools.jconsole.JConsoleContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.io.Console;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {
    private final PatientRepository PatientRepository;
    private final WebClient.Builder webClientBuilder;

    public List<PatientResponse> getPatientsBySecretaire(Long idSecretaire) {
        List<Patient> Patients = PatientRepository.findByIdSecretaire(idSecretaire);
        return Patients.stream().map(Patient -> mapToPatientResponse(Patient)).toList() ;
    }


    public void createPatient(PatientRequest PatientRequest){
        Patient patient = Patient.builder()
                .cin(PatientRequest.getCin())
                .nom(PatientRequest.getNom())
                .dateNaissance(PatientRequest.getDateNaissance())
                .sexe(PatientRequest.getSexe())
                .dossierMedical(PatientRequest.getDossierMedical())
                .idSecretaire(PatientRequest.getIdSecretaire())
                .prenom(PatientRequest.getPrenom())
                .typeMutuelle(PatientRequest.getTypeMutuelle())
                .numTel(PatientRequest.getNumTel())
                .build();
        PatientRepository.save(patient);
        log.info("Patient "+patient.getIdPatient() +" saved");
    }

    public List<PatientResponse> getAllPatients(){
        List<Patient> Patients = PatientRepository.findAll();
        return Patients.stream().map(Patient -> mapToPatientResponse(Patient)).toList();
    }

    public PatientResponseDTO getById(Integer id) {
        Patient patient = PatientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient introuvable"));
        return PatientResponseDTO.builder()
                .cin(patient.getCin())
                .nom(patient.getNom())
                .dateNaissance(patient.getDateNaissance())
                .sexe(patient.getSexe())
                .idSecretaire(patient.getIdSecretaire())
                .prenom(patient.getPrenom())
                .typeMutuelle(patient.getTypeMutuelle())
                .IdPatient(patient.getIdPatient())
                .numTel(patient.getNumTel())
                .build();
    }


    private PatientResponse mapToPatientResponse(Patient patient) {
        return PatientResponse.builder()
                .cin(patient.getCin())
                .nom(patient.getNom())
                .dateNaissance(patient.getDateNaissance())
                .sexe(patient.getSexe())
                .dossierMedical(patient.getDossierMedical())
                .idSecretaire(patient.getIdSecretaire())
                .prenom(patient.getPrenom())
                .typeMutuelle(patient.getTypeMutuelle())
                .IdPatient(patient.getIdPatient())
                .numTel(patient.getNumTel())
                .build();
    }

    // retourner rendez vous plus des infos client par web client
    public RendezVousPatient getRendezVousPatient(Integer idPatient){
        Patient patient = PatientRepository.findById(idPatient)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient introuvable avec l'ID : " + idPatient
                ));
        List<RendezVousResponse> resultList;
        try {
            resultList = webClientBuilder.build().get()
                    .uri("http://RENDEZVOUS/api/RendezVous/idPatient",
                            uriBuilder -> uriBuilder.queryParam("idPatient", idPatient).build())
                    .retrieve()
                    .bodyToFlux(RendezVousResponse.class)
                    .collectList()
                    .block();
        }catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Service RENDEZVOUS indisponible",
                    e
            );
        }


        if (resultList == null || resultList.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun rendez-vous trouvé pour le patient ID : " + idPatient
            );
        }
        RendezVousResponse result = resultList.get(0);
        RendezVousPatient rendezVousPatient = RendezVousPatient.builder()
                .idMedecin(result.getIdMedecin())
                .statut(result.getStatut())
                .motif(result.getMotif())
                .heureDebut(result.getHeureDebut())
                .dateRdvs(result.getDateRdvs())
                .heureFin(result.getHeureFin())
                .numTel(patient.getNumTel())
                .idConsultation(result.getIdConsultation())
                .remarque(result.getRemarque())
                .cin(patient.getCin())
                .sexe(patient.getSexe())
                .motif(result.getMotif())
                .idSecretaire(result.getIdSecretaire())
                .nom(patient.getNom())
                .prenom(patient.getPrenom())
                .typeMutuelle(patient.getTypeMutuelle())
                .dateNaissance(patient.getDateNaissance())
                .dossierMedical(patient.getDossierMedical())
                .build();

        return rendezVousPatient;
    }






}
