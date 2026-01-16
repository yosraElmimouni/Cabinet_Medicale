package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.ConsultationRequest;
import com.exemple.patient_medical_service.dto.ConsultationResponse;
import com.exemple.patient_medical_service.dto.RendezVousConsultation;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
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
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsultationServiceTest {

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private WebClient.Builder webClient;

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

        consultation = Consultation.builder()
                .idConsultation(1)
                .type("Générale")
                .dateConsultation(LocalDate.now())
                .diagnostic("Grippe saisonnière")
                .idMedecin(10)
                .idRendezVous(50)
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

    @Test
    void createConsultation_SaveConsultation_RendezVousTerminated() {
        // ARRANGE
        // 1. Mock du repository pour retourner l'objet RV Terminé
        when(webClient.build().get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(RendezVousConsultation.class)).thenReturn(Mono.just(rvTermine));

        // ACT
        consultationService.createConsultation(consultationRequest);

        // ASSERT
        // 1. Vérifier que l'appel au service de Rendez-vous a eu lieu
        verify(webClient, times(1)).build().get();
        verify(requestHeadersUriSpec, times(1)).uri(anyString(), any(Function.class));

        // 2. Vérifier que la consultation a été sauvegardée
        ArgumentCaptor<Consultation> consultationCaptor = ArgumentCaptor.forClass(Consultation.class);
        verify(consultationRepository, times(1)).save(consultationCaptor.capture());

        Consultation savedConsultation = consultationCaptor.getValue();
        assertEquals("Générale", savedConsultation.getType());
        assertEquals(50, savedConsultation.getIdRendezVous());
    }

    @Test
    void createConsultation() {
        // ARRANGE
        consultationRequest.setIdRendezVous(51); // Utiliser le RV non terminé
        // 1. Mock du repository pour retourner l'objet RV Non Terminé
        when(webClient.build().get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(RendezVousConsultation.class)).thenReturn(Mono.just(rvNonTermine));

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            consultationService.createConsultation(consultationRequest);
        });

        assertEquals("RendezVous non encore terminée , veillez attender", exception.getMessage());
        // 2. Vérifier qu'aucune sauvegarde n'a eu lieu
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
        // 2. Vérifier qu'aucune interaction avec WebClient ou Repository n'a eu lieu
        verifyNoInteractions(webClient);
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
        assertEquals("Grippe saisonnière", result.get(0).getDiagnostic());
        assertEquals("Allergie", result.get(1).getDiagnostic());
        verify(consultationRepository, times(1)).findAll();
    }
}
