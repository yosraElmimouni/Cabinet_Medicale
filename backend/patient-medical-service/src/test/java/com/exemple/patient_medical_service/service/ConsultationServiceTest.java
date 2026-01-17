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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersUriSpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;
import org.springframework.web.reactive.function.client.WebClient.ResponseSpec;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsultationServiceTest {

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @Mock
    private DossierMedicalRepository dossierMedicalRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private ConsultationService consultationService;

    // Mocks pour la chaîne de WebClient
    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RequestHeadersSpec requestHeadersSpec;
    @Mock
    private ResponseSpec responseSpec;

    private ConsultationRequest consultationRequest;
    private Consultation consultation;
    private RendezVousConsultation rvTermine;
    private RendezVousConsultation rvNonTermine;
    private Patient patient;
    private DossierMedical dossierMedical;

    @BeforeEach
    void setUp() {
        // Initialisation des objets de données de test
        consultationRequest = ConsultationRequest.builder()
                .type("Générale")
                .dateConsultation(LocalDate.now())
                .diagnostic("Grippe saisonnière")
                .idMedecin(10)
                .idRendezVous(50)
                .build();

        patient = Patient.builder()
                .idPatient(1)
                .nom("Dupont")
                .prenom("Jean")
                .build();

        dossierMedical = DossierMedical.builder()
                .idDossier(1)
                .patient(patient)
                .build();

        consultation = Consultation.builder()
                .idConsultation(1)
                .type("Générale")
                .dateConsultation(LocalDate.now())
                .diagnostic("Grippe saisonnière")
                .idMedecin(10)
                .idRendezVous(50)
                .dossierMedical(dossierMedical)
                .build();

        rvTermine = RendezVousConsultation.builder()
                .RendezVousId(50)
                .isTerminate(true)
                .idPatient(1)
                .build();

        rvNonTermine = RendezVousConsultation.builder()
                .RendezVousId(51)
                .isTerminate(false)
                .build();
    }

    private void mockWebClient(RendezVousConsultation response) {
        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(RendezVousConsultation.class)).thenReturn(Mono.just(response));
    }

    @Test
    void createConsultation_SaveConsultation_RendezVousTerminated() {
        // ARRANGE
        mockWebClient(rvTermine);
        when(dossierMedicalRepository.findByPatientId(1)).thenReturn(Optional.of(dossierMedical));

        // ACT
        consultationService.createConsultation(consultationRequest);

        // ASSERT
        verify(webClientBuilder, times(1)).build();
        verify(consultationRepository, times(1)).save(any(Consultation.class));
    }

    @Test
    void createConsultation_RendezVousNotTerminated() {
        // ARRANGE
        consultationRequest.setIdRendezVous(51);
        mockWebClient(rvNonTermine);

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            consultationService.createConsultation(consultationRequest);
        });

        assertEquals("Rendez-vous non encore terminé, veuillez attendre", exception.getMessage());
        verify(consultationRepository, never()).save(any(Consultation.class));
    }

    @Test
    void createConsultation_whenRendezVousIdIsNull() {
        // ARRANGE
        consultationRequest.setIdRendezVous(null);

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            consultationService.createConsultation(consultationRequest);
        });

        assertEquals("L'id du rendez-vous est obligatoire !", exception.getMessage());
        verifyNoInteractions(webClientBuilder);
        verifyNoInteractions(consultationRepository);
    }

    @Test
    void getAllConsultation() {
        // ARRANGE
        Consultation consultation2 = Consultation.builder().idConsultation(2).type("Spécialisée").diagnostic("Allergie").build();
        List<Consultation> consultationList = Arrays.asList(consultation, consultation2);
        when(consultationRepository.findAll()).thenReturn(consultationList);

        // ACT
        List<ConsultationResponse> result = consultationService.getAllConsultation();

        // ASSERT
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(consultationRepository, times(1)).findAll();
    }
}
