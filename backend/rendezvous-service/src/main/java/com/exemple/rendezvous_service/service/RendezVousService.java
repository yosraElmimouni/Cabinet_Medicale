package com.exemple.rendezvous_service.service;

import com.exemple.rendezvous_service.dto.*;
import com.exemple.rendezvous_service.model.RendezVous;
import com.exemple.rendezvous_service.model.StatutRendezVous;
import com.exemple.rendezvous_service.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RendezVousService {
    private final RendezVousRepository rendezVousRepository;
    private final WebClient.Builder webClientBuilder;


    public void createRendezVous(RendezVousRequest rendezVousRequest){
        RendezVous rendezVous = RendezVous.builder()
                .dateRdvs(rendezVousRequest.getDateRdvs())
                .heureDebut(rendezVousRequest.getHeureDebut())
                .motif(rendezVousRequest.getMotif())
                .heureFin(rendezVousRequest.getHeureFin())
                .idConsultation(rendezVousRequest.getIdConsultation())
                .idMedecin(rendezVousRequest.getIdMedecin())
                .idPatient(rendezVousRequest.getIdPatient())
                .remarque(rendezVousRequest.getRemarque())
                .statut(rendezVousRequest.getStatut())
                .idSecretaire(rendezVousRequest.getIdSecretaire())
                .build();
        rendezVousRepository.save(rendezVous);
        log.info("RendezVous "+rendezVous.getIdRendezVous() +" saved");
    }

    public List<RendezVousResponse> getAllRendezVouss(){
        List<RendezVous> rendezVous = rendezVousRepository.findAll();
        return rendezVous.stream().map(RendezVous -> mapToRendezVousResponse(RendezVous)).toList();
    }

    private RendezVousResponse mapToRendezVousResponse(RendezVous rendezVous) {
        return RendezVousResponse.builder()
                .dateRdvs(rendezVous.getDateRdvs())
                .heureDebut(rendezVous.getHeureDebut())
                .motif(rendezVous.getMotif())
                .heureFin(rendezVous.getHeureFin())
                .idConsultation(rendezVous.getIdConsultation())
                .idMedecin(rendezVous.getIdMedecin())
                .idPatient(rendezVous.getIdPatient())
                .remarque(rendezVous.getRemarque())
                .statut(rendezVous.getStatut())
                .idSecretaire(rendezVous.getIdSecretaire())
                .idRendezVous(rendezVous.getIdRendezVous())
                .build();
    }

    @Transactional
    public RendezVousConsultation isTerminate(Integer idRV){
        RendezVous rv = rendezVousRepository.findById(idRV)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));

        rv.setStatut(StatutRendezVous.TERMINE);
        rendezVousRepository.save(rv);

        return RendezVousConsultation.builder()
                .RendezVousId(rv.getIdRendezVous())
                .isTerminate(rv.getStatut() == StatutRendezVous.TERMINE)
                .idPatient(rv.getIdPatient())
                .build();
    }

    @Transactional
    public RendezVousConsultation isTerminateMedcin(Integer idRV){
        RendezVous rv = rendezVousRepository.findById(idRV)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));

        rv.setStatut(StatutRendezVous.TERMINEMEDCIN);
        rendezVousRepository.save(rv);

        return RendezVousConsultation.builder()
                .RendezVousId(rv.getIdRendezVous())
                .isTerminate(rv.getStatut() == StatutRendezVous.TERMINEMEDCIN)
                .idPatient(rv.getIdPatient())
                .build();
    }


    @Transactional(readOnly = true)
    public List<RendezVousResponse> getByIdPatient(Integer idPatient){
        List<RendezVous> rv = rendezVousRepository.findByIdPatient(idPatient);

        return rv.stream()
                .map(this::mapToRendezVousResponse) // map chaque RendezVous -> RendezVousResponse
                .toList();
    }



    @Transactional(readOnly = true)
    public DossierMedicalConsultationsRendezVousDTO getByIdPatientDetaille(Integer idPatient){

        DossierMedicalConsultationsDTO result =
                webClientBuilder.build().get()
                .uri("http://PATIENT-MEDICAL/api/DossierMedical/ConsultationsParPatient", uriBuilder -> uriBuilder
                        .queryParam("idPatient", idPatient).build())
                .retrieve()
                .bodyToMono(DossierMedicalConsultationsDTO.class).block();
        List<RendezVous> rendezVous = rendezVousRepository.findByIdPatient(result.getPatient().getIdPatient());
        List<RendezVousResponse> rendezVousResponses = rendezVous.stream().map(RendezVous -> mapToRendezVousResponse(RendezVous)).toList();
        DossierMedicalConsultationsRendezVousDTO rendezVousDTO=DossierMedicalConsultationsRendezVousDTO.builder()
                .rendezVousResponse(rendezVousResponses)
                .consultationResponsesListe(result)
                .rendezVousResponse(rendezVousResponses)
                .build();
        return rendezVousDTO;
    }

    @Transactional(readOnly = true)
    public DossierMedicalConsultationsRendezVousDTO getByIdPatientDetailleParid(Integer idRV){

        // 1️⃣ Vérifier si le rendez-vous existe
        RendezVous rendezVous = rendezVousRepository.findById(idRV)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Rendez-vous introuvable avec l'id : " + idRV
                ));

        Integer idPatient = rendezVous.getIdPatient();

        // 2️⃣ Appel du microservice PATIENT-MEDICAL avec gestion d'erreurs
        DossierMedicalConsultationsDTO result;
        try {
            result = webClientBuilder.build()
                    .get()
                    .uri("http://PATIENT-MEDICAL/api/DossierMedical/ConsultationsParPatient",
                            uriBuilder -> uriBuilder.queryParam("idPatient", idPatient).build())
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            response -> Mono.error(new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Patient introuvable avec l'id : " + idPatient
                            ))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            response -> Mono.error(new ResponseStatusException(
                                    HttpStatus.SERVICE_UNAVAILABLE,
                                    "Service PATIENT-MEDICAL indisponible"
                            ))
                    )
                    .bodyToMono(DossierMedicalConsultationsDTO.class)
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Erreur lors de l'appel au service PATIENT-MEDICAL"
            );
        }

        // 3️⃣ Vérifier si le dossier médical existe
        if (result == null || result.getPatient() == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Dossier médical introuvable pour le patient ID : " + idPatient
            );
        }

        // 4️⃣ Récupérer les rendez-vous du patient
        List<RendezVous> rendezVousList =
                rendezVousRepository.findByIdPatient(idPatient);

        if (rendezVousList.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun rendez-vous trouvé pour le patient ID : " + idPatient
            );
        }

        // 5️⃣ Mapping
        List<RendezVousResponse> rendezVousResponses = rendezVousList.stream()
                .map(this::mapToRendezVousResponse)
                .toList();

        // 6️⃣ Construction du DTO final
        return DossierMedicalConsultationsRendezVousDTO.builder()
                .rendezVousResponse(rendezVousResponses)
                .consultationResponsesListe(result)
                .build();
    }

    public List<RendezVousResponse> findByIdSecretaire(Integer id){
        List<RendezVous> rendezVous = rendezVousRepository.findByIdSecretaire(id);
        return rendezVous.stream().map(RendezVous -> mapToRendezVousResponse(RendezVous)).toList();
    }


    public List<RendezVousResponse> findByIdMedcin(Integer id){
        List<RendezVous> rendezVous = rendezVousRepository.findByIdMedecin(id);
        return rendezVous.stream().map(RendezVous -> mapToRendezVousResponse(RendezVous)).toList();
    }

    @Transactional(readOnly = true)
    public List<DossierMedicalConsultationsRendezVousDTO> getByIdMedcinDetaille(Integer idmedcin) {

        // 1️⃣ Récupérer les rendez-vous de la secrétaire
        List<RendezVous> rendezVousList =
                rendezVousRepository.findByIdMedecin(idmedcin);

        if (rendezVousList.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun rendez-vous trouvé pour la idmedcin ID : " + idmedcin
            );
        }

        // 2️⃣ Pour chaque rendez-vous → enrichir avec dossier médical
        return rendezVousList.stream().map(rv -> {

            Integer idPatient = rv.getIdPatient();

            // 3️⃣ Appel du microservice PATIENT-MEDICAL
            DossierMedicalConsultationsDTO dossierMedical;
            try {
                dossierMedical = webClientBuilder.build()
                        .get()
                        .uri("http://PATIENT-MEDICAL/api/DossierMedical/ConsultationsParPatient",
                                uriBuilder -> uriBuilder
                                        .queryParam("idPatient", idPatient)
                                        .build())
                        .retrieve()
                        .bodyToMono(DossierMedicalConsultationsDTO.class)
                        .block();
            } catch (Exception e) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Erreur lors de l'appel au service PATIENT-MEDICAL"
                );
            }

            if (dossierMedical == null || dossierMedical.getPatient() == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Dossier médical introuvable pour le patient ID : " + idPatient
                );
            }

            // 4️⃣ Mapper le rendez-vous
            RendezVousResponse rendezVousResponse = mapToRendezVousResponse(rv);

            // 5️⃣ Construire le DTO final
            return DossierMedicalConsultationsRendezVousDTO.builder()
                    .rendezVousResponse(List.of(rendezVousResponse)) // un seul RV
                    .consultationResponsesListe(dossierMedical)
                    .build();

        }).toList();
    }


    @Transactional(readOnly = true)
    public List<DossierMedicalConsultationsRendezVousDTO> getByIdSecretaireDetaille(Integer idSecretaire) {

        // 1️⃣ Récupérer les rendez-vous de la secrétaire
        List<RendezVous> rendezVousList =
                rendezVousRepository.findByIdSecretaire(idSecretaire);

        if (rendezVousList.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun rendez-vous trouvé pour la secrétaire ID : " + idSecretaire
            );
        }

        // 2️⃣ Pour chaque rendez-vous → enrichir avec dossier médical
        return rendezVousList.stream().map(rv -> {

            Integer idPatient = rv.getIdPatient();

            // 3️⃣ Appel du microservice PATIENT-MEDICAL
            DossierMedicalConsultationsDTO dossierMedical;
            try {
                dossierMedical = webClientBuilder.build()
                        .get()
                        .uri("http://PATIENT-MEDICAL/api/DossierMedical/ConsultationsParPatient",
                                uriBuilder -> uriBuilder
                                        .queryParam("idPatient", idPatient)
                                        .build())
                        .retrieve()
                        .bodyToMono(DossierMedicalConsultationsDTO.class)
                        .block();
            } catch (Exception e) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Erreur lors de l'appel au service PATIENT-MEDICAL"
                );
            }

            if (dossierMedical == null || dossierMedical.getPatient() == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Dossier médical introuvable pour le patient ID : " + idPatient
                );
            }

            // 4️⃣ Mapper le rendez-vous
            RendezVousResponse rendezVousResponse = mapToRendezVousResponse(rv);

            // 5️⃣ Construire le DTO final
            return DossierMedicalConsultationsRendezVousDTO.builder()
                    .rendezVousResponse(List.of(rendezVousResponse)) // un seul RV
                    .consultationResponsesListe(dossierMedical)
                    .build();

        }).toList();
    }


    @Transactional(readOnly = true)
    public List<RendezVousPatientMedcin> getByIdSecretaire(Integer idSecretaire) {

        // 1️⃣ Récupérer les rendez-vous de la secrétaire
        List<RendezVous> rendezVousList =
                rendezVousRepository.findByIdSecretaire(idSecretaire);

        if (rendezVousList.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun rendez-vous trouvé pour la secrétaire ID : " + idSecretaire
            );
        }

        // 2️⃣ Grouper les rendez-vous par patient
        Map<Integer, List<RendezVous>> rendezVousParPatient =
                rendezVousList.stream()
                        .collect(Collectors.groupingBy(RendezVous::getIdPatient));

        // 3️⃣ Construire la réponse finale
        return rendezVousParPatient.entrySet().stream().map(entry -> {

            Integer idPatient = entry.getKey();
            List<RendezVous> rvPatient = entry.getValue();

            // 4️⃣ Appel microservice PATIENT
            PatientResponse patientResponse;
            try {
                patientResponse = webClientBuilder.build()
                        .get()
                        .uri("http://PATIENT-MEDICAL/api/Patient/Patient",
                                uriBuilder -> uriBuilder
                                        .queryParam("idPatient", idPatient)
                                        .build())
                        .retrieve()
                        .bodyToMono(PatientResponse.class)
                        .block();
            } catch (Exception e) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Erreur lors de l'appel au service PATIENT"
                );
            }

            if (patientResponse == null || patientResponse.getIdPatient() == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient introuvable ID : " + idPatient
                );
            }

            // 5️⃣ Mapper les rendez-vous
            List<RendezVousResponse> rendezVousResponses =
                    rvPatient.stream()
                            .map(this::mapToRendezVousResponse)
                            .toList();

            // 6️⃣ Construire le DTO final
            return new RendezVousPatientMedcin(
                    patientResponse,
                    rendezVousResponses
            );

        }).toList();
    }


    @Transactional(readOnly = true)
    public List<RendezVousPatientMedcin> getByIdMedcin(Integer idMedcin) {

        // 1️⃣ Récupérer les rendez-vous de la secrétaire
        List<RendezVous> rendezVousList =
                rendezVousRepository.findByIdMedecin(idMedcin);

        if (rendezVousList.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun rendez-vous trouvé pour la idMedcin ID : " + idMedcin
            );
        }

        // 2️⃣ Grouper les rendez-vous par patient
        Map<Integer, List<RendezVous>> rendezVousParPatient =
                rendezVousList.stream()
                        .collect(Collectors.groupingBy(RendezVous::getIdPatient));

        // 3️⃣ Construire la réponse finale
        return rendezVousParPatient.entrySet().stream().map(entry -> {

            Integer idPatient = entry.getKey();
            List<RendezVous> rvPatient = entry.getValue();

            // 4️⃣ Appel microservice PATIENT
            PatientResponse patientResponse;
            try {
                patientResponse = webClientBuilder.build()
                        .get()
                        .uri("http://PATIENT-MEDICAL/api/Patient/Patient",
                                uriBuilder -> uriBuilder
                                        .queryParam("idPatient", idPatient)
                                        .build())
                        .retrieve()
                        .bodyToMono(PatientResponse.class)
                        .block();
            } catch (Exception e) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Erreur lors de l'appel au service PATIENT"
                );
            }

            if (patientResponse == null || patientResponse.getIdPatient() == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient introuvable ID : " + idPatient
                );
            }

            // 5️⃣ Mapper les rendez-vous
            List<RendezVousResponse> rendezVousResponses =
                    rvPatient.stream()
                            .map(this::mapToRendezVousResponse)
                            .toList();

            // 6️⃣ Construire le DTO final
            return new RendezVousPatientMedcin(
                    patientResponse,
                    rendezVousResponses
            );

        }).toList();
    }





}
