package com.exemple.rendezvous_service.service;

import com.exemple.rendezvous_service.dto.*;
import com.exemple.rendezvous_service.model.*;
import com.exemple.rendezvous_service.repository.RendezVousRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RendezVousServiceTest {
    @Mock
    private RendezVousRepository rendezVousRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

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
    private RendezVousRequest rendezVousRequest;

    @BeforeEach
    void setUp(){
        rendezVousRequest = RendezVousRequest.builder()
                .dateRdvs(LocalDate.now())
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .motif("Consultation annuelle")
                .idMedecin(1)
                .idPatient(1)
                .statut(StatutRendezVous.CONFIRME)
                .build();

        rendezVous = RendezVous.builder()
                .idRendezVous(1)
                .dateRdvs(LocalDate.now())
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .motif("Consultation annuelle")
                .idPatient(1)
                .statut(StatutRendezVous.CONFIRME)
                .build();
    }

    @Test
    void createRendezVous(){
        rendezVousService.createRendezVous(rendezVousRequest);
        verify(rendezVousRepository, times(1)).save(any(RendezVous.class));
    }

    @Test
    void getAllRendezVous(){
        when(rendezVousRepository.findAll()).thenReturn(Arrays.asList(rendezVous));
        List<RendezVousResponse> result = rendezVousService.getAllRendezVouss();
        assertEquals(1, result.size());
    }

    @Test
    void isTerminate(){
        when(rendezVousRepository.findById(1)).thenReturn(Optional.of(rendezVous));
        RendezVousConsultation result = rendezVousService.isTerminate(1);
        assertTrue(result.isTerminate());
        verify(rendezVousRepository, times(1)).save(rendezVous);
    }

    @Test
    void getByIdPatientDetaille() {
        Integer idPatient = 1;
        DossierMedicalConsultationsDTO mockDossier = DossierMedicalConsultationsDTO.builder()
                .patient(PatientDTO.builder().idPatient(idPatient).build())
                .build();

        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(DossierMedicalConsultationsDTO.class)).thenReturn(Mono.just(mockDossier));
        
        when(rendezVousRepository.findByIdPatient(idPatient)).thenReturn(Arrays.asList(rendezVous));

        DossierMedicalConsultationsRendezVousDTO result = rendezVousService.getByIdPatientDetaille(idPatient);

        assertNotNull(result);
    }

    @Test
    void getByIdPatientDetailleParid() {
        Integer idRV = 1;
        Integer idPatient = 1;
        when(rendezVousRepository.findById(idRV)).thenReturn(Optional.of(rendezVous));
        
        DossierMedicalConsultationsDTO mockDossier = DossierMedicalConsultationsDTO.builder()
                .patient(PatientDTO.builder().idPatient(idPatient).build())
                .build();

        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(Predicate.class), any(Function.class))).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(DossierMedicalConsultationsDTO.class)).thenReturn(Mono.just(mockDossier));

        when(rendezVousRepository.findByIdPatient(idPatient)).thenReturn(Arrays.asList(rendezVous));

        DossierMedicalConsultationsRendezVousDTO result = rendezVousService.getByIdPatientDetailleParid(idRV);

        assertNotNull(result);
    }
}
