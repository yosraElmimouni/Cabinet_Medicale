package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.PatientRequest;
import com.exemple.patient_medical_service.dto.PatientResponse;
import com.exemple.patient_medical_service.dto.RendezVousPatient;
import com.exemple.patient_medical_service.dto.RendezVousResponse;
import com.exemple.patient_medical_service.model.Patient;
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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @InjectMocks
    private PatientService patientService;

    // Mocks pour la chaîne de WebClient
    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RequestHeadersSpec requestHeadersSpec;
    @Mock
    private ResponseSpec responseSpec;

    private Patient patient;
    private PatientRequest patientRequest;
    private RendezVousResponse rendezVousResponse;

    @BeforeEach
    void setUp() {
        patientRequest = PatientRequest.builder()
                .cin("AB12345")
                .nom("Dupont")
                .prenom("Jean")
                .dateNaissance(LocalDate.of(1980, 1, 1))
                .sexe("M")
                .idSecretaire(1)
                .typeMutuelle("CNAM")
                .build();

        patient = Patient.builder()
                .idPatient(1)
                .cin("AB12345")
                .nom("Dupont")
                .prenom("Jean")
                .dateNaissance(LocalDate.of(1980, 1, 1))
                .sexe("M")
                .idSecretaire(1)
                .typeMutuelle("CNAM")
                .numTel("0600000000")
                .build();

        rendezVousResponse = RendezVousResponse.builder()
                .idRendezVous(101)
                .dateRdvs(LocalDate.of(2025, 12, 20))
                .heureDebut(LocalTime.of(10, 0))
                .heureFin(LocalTime.of(10, 30))
                .statut("CONFIRME")
                .motif("Consultation annuelle")
                .idMedecin(5)
                .idSecretaire(1)
                .idConsultation(201)
                .idPatient(1)
                .build();
    }

    private void mockWebClient(List<RendezVousResponse> responses) {
        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(RendezVousResponse.class)).thenReturn(Flux.fromIterable(responses));
    }

    @Test
    void createPatient() {
        patientService.createPatient(patientRequest);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void getAllPatients() {
        when(patientRepository.findAll()).thenReturn(Arrays.asList(patient));
        List<PatientResponse> result = patientService.getAllPatients();
        assertEquals(1, result.size());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void getRendezVousPatient() {
        Integer patientId = 1;
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        mockWebClient(Arrays.asList(rendezVousResponse));

        RendezVousPatient result = patientService.getRendezVousPatient(patientId);

        assertNotNull(result);
        assertEquals(patient.getCin(), result.getCin());
        verify(patientRepository, times(1)).findById(patientId);
    }

    @Test
    void getRendezVousPatient_shouldThrowException_whenPatientNotFound() {
        Integer patientId = 999;
        when(patientRepository.findById(patientId)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> {
            patientService.getRendezVousPatient(patientId);
        });

        verify(patientRepository, times(1)).findById(patientId);
        verifyNoInteractions(webClientBuilder);
    }
}
