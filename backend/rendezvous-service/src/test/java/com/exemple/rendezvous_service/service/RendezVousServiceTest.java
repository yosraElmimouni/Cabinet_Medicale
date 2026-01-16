package com.exemple.rendezvous_service.service;

import com.exemple.rendezvous_service.dto.*;
import com.exemple.rendezvous_service.model.*;
import com.exemple.rendezvous_service.repository.RendezVousRepository;
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
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RendezVousServiceTest {
    @Mock
    private RendezVousRepository rendezVousRepository;

    @Mock
    private WebClient webClient;

    @InjectMocks
    private RendezVousService rendezVousService;

    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RequestHeadersSpec requestHeadersSpec;
    @Mock
    private ResponseSpec responseSpec;

    private RendezVous rendezVous;
    private RendezVousResponse rendezVousResponse;
    private RendezVousConsultation rendezVousConsultation;
    private RendezVousRequest rendezVousRequest;

    @BeforeEach
    void setUp(){
        rendezVousRequest = RendezVousRequest.builder()
                .dateRdvs(LocalDate.now())
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .motif("Consultation annuelle")
                .idConsultation(1)
                .idMedecin(1)
                .idPatient(1)
                .remarque("remarquee")
                .statut(StatutRendezVous.CONFIRME)
                .idSecretaire(2)
                .build();

        rendezVous=RendezVous.builder()
                .idRendezVous(1)
                .dateRdvs(LocalDate.now())
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .motif("Consultation annuelle")
                .idConsultation(1)
                .idMedecin(1)
                .idPatient(1)
                .remarque("remarquee")
                .statut(StatutRendezVous.CONFIRME)
                .idSecretaire(2)
                .build();

    }

    @Test
    void createRendezVous(){
        rendezVousService.createRendezVous(rendezVousRequest);
        ArgumentCaptor<RendezVous> Captor = ArgumentCaptor.forClass(RendezVous.class);
        verify(rendezVousRepository, times(1)).save(Captor.capture());

        RendezVous saved = Captor.getValue();
        assertEquals(LocalTime.of(10, 30), saved.getHeureFin());
        assertEquals(StatutRendezVous.CONFIRME, saved.getStatut());
    }

    @Test
    void getAllRendezVous(){
        RendezVous rendezVous1 = RendezVous.builder()
                .idRendezVous(2)
                .dateRdvs(LocalDate.now())
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .motif("Consultation annuelle 2")
                .idConsultation(1)
                .idMedecin(1)
                .idPatient(1)
                .remarque("remarquee2")
                .statut(StatutRendezVous.ANNULE)
                .idSecretaire(1)
                .build();
        List<RendezVous> List = Arrays.asList(rendezVous, rendezVous1);
        when(rendezVousRepository.findAll()).thenReturn(List);

        // ACT
        List<RendezVousResponse> result = rendezVousService.getAllRendezVouss();

        // ASSERT
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("remarquee", result.get(0).getRemarque());
        assertEquals("Consultation annuelle 2", result.get(1).getMotif());
        verify(rendezVousRepository, times(1)).findAll();
    }

    @Test
    void isTerminate(){
        Integer idRendezVous=1;
        when(rendezVousRepository.findById(idRendezVous)).thenReturn(java.util.Optional.of(rendezVous));

        rendezVousConsultation = rendezVousService.isTerminate(idRendezVous);

        assertNotNull(rendezVousConsultation);
        assertEquals(StatutRendezVous.TERMINE, rendezVous.getStatut());
        assertTrue(rendezVousConsultation.isTerminate());

        verify(rendezVousRepository, times(1)).findById(idRendezVous);
        verify(rendezVousRepository, times(1)).save(rendezVous);
    }


    @Test
    void getByIdPatient() {
        // ARRANGE
        Integer idPatient = 1;
        RendezVous rv1 = RendezVous.builder()
                .idRendezVous(1)
                .dateRdvs(LocalDate.now())
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .motif("Motif 1")
                .idPatient(idPatient)
                .statut(StatutRendezVous.CONFIRME)
                .build();
        RendezVous rv2 = RendezVous.builder()
                .idRendezVous(2)
                .dateRdvs(LocalDate.now().plusDays(1))
                .heureDebut(LocalTime.of(11, 0))
                .heureFin(LocalTime.of(11, 30))
                .motif("Motif 2")
                .idPatient(idPatient)
                .statut(StatutRendezVous.ANNULE)
                .build();
        List<RendezVous> rendezVousList = Arrays.asList(rv1, rv2);

        when(rendezVousRepository.findByIdPatient(idPatient)).thenReturn(rendezVousList);


        List<RendezVousResponse> result = rendezVousService.getByIdPatient(idPatient);


        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Motif 1", result.get(0).getMotif());
        assertEquals(StatutRendezVous.ANNULE, result.get(1).getStatut());
        verify(rendezVousRepository, times(1)).findByIdPatient(idPatient);
    }


    @Test
    void getByIdPatientDetaille() {
        // ARRANGE
        Integer idPatient = 1;
        String expectedUri = "http://localhost:8083/api/DossierMedical/ConsultationsParPatient?idPatient=" + idPatient;

        // Mock WebClient response for DossierMedicalConsultationsDTO
        DossierMedicalConsultationsDTO mockDossier = DossierMedicalConsultationsDTO.builder()
                .patient(PatientDTO.builder().idPatient(idPatient).build())
                .consultationResponsesListe(Arrays.asList(ConsultationResponseDTO.builder().idConsultation(1).build()))
                .build();

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("http://localhost:8083/api/DossierMedical/ConsultationsParPatient"), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(DossierMedicalConsultationsDTO.class)).thenReturn(Mono.just(mockDossier));

        // Mock RendezVousRepository response
        RendezVous rv = RendezVous.builder()
                .idRendezVous(1)
                .idPatient(idPatient)
                .motif("Test RV")
                .build();
        List<RendezVous> rendezVousList = Arrays.asList(rv);
        when(rendezVousRepository.findByIdPatient(idPatient)).thenReturn(rendezVousList);

        // ACT
        DossierMedicalConsultationsRendezVousDTO result = rendezVousService.getByIdPatientDetaille(idPatient);

        // ASSERT
        assertNotNull(result);
        assertEquals(1, result.getRendezVousResponse().size());
        assertEquals("Test RV", result.getRendezVousResponse().get(0).getMotif());
        assertNotNull(result.getConsultationResponsesListe());
        assertEquals(1, result.getConsultationResponsesListe().getConsultationResponsesListe().size());

        verify(webClient, times(1)).get();
        verify(rendezVousRepository, times(1)).findByIdPatient(idPatient);
    }

    @Test
    void getByIdPatientDetailleParid() {
        // ARRANGE
        Integer idRendezVous = 1;
        Integer idPatient = 2;
        String expectedUri = "http://localhost:8083/api/DossierMedical/ConsultationsParPatient?idPatient=" + idPatient;

        // Mock findById to get idPatient
        RendezVous rvWithPatientId = RendezVous.builder().idRendezVous(idRendezVous).idPatient(idPatient).build();
        when(rendezVousRepository.findById(idRendezVous)).thenReturn(java.util.Optional.of(rvWithPatientId));

        // Mock WebClient response for DossierMedicalConsultationsDTO
        DossierMedicalConsultationsDTO mockDossier = DossierMedicalConsultationsDTO.builder()
                .patient(PatientDTO.builder().idPatient(idPatient).build())
                .consultationResponsesListe(Arrays.asList(ConsultationResponseDTO.builder().idConsultation(1).build()))
                .build();

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("http://localhost:8083/api/DossierMedical/ConsultationsParPatient"), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(DossierMedicalConsultationsDTO.class)).thenReturn(Mono.just(mockDossier));

        // Mock RendezVousRepository response for findByIdPatient
        RendezVous rv = RendezVous.builder()
                .idRendezVous(1)
                .idPatient(idPatient)
                .motif("Test RV Par ID")
                .build();
        List<RendezVous> rendezVousList = Arrays.asList(rv);
        when(rendezVousRepository.findByIdPatient(idPatient)).thenReturn(rendezVousList);

        // ACT
        DossierMedicalConsultationsRendezVousDTO result = rendezVousService.getByIdPatientDetailleParid(idRendezVous);

        // ASSERT
        assertNotNull(result);
        assertEquals(1, result.getRendezVousResponse().size());
        assertEquals("Test RV Par ID", result.getRendezVousResponse().get(0).getMotif());
        assertNotNull(result.getConsultationResponsesListe());

        verify(rendezVousRepository, times(1)).findById(idRendezVous);
        verify(webClient, times(1)).get();
        verify(rendezVousRepository, times(1)).findByIdPatient(idPatient);
    }

}
