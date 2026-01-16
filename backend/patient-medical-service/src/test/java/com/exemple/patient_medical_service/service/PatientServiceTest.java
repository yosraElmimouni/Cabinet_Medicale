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
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

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
        // Initialisation des objets de données de test
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

    @Test
    void createPatient() {
        // ACT
        patientService.createPatient(patientRequest);

        // ASSERT
        // Capture l'argument passé à la méthode save
        ArgumentCaptor<Patient> patientCaptor = ArgumentCaptor.forClass(Patient.class);
        verify(patientRepository, times(1)).save(patientCaptor.capture());

        Patient savedPatient = patientCaptor.getValue();
        assertEquals("AB12345", savedPatient.getCin());
        assertEquals("Dupont", savedPatient.getNom());
        assertEquals("Jean", savedPatient.getPrenom());
        // On ne vérifie pas tous les champs, juste les principaux
    }

    @Test
    void getAllPatients() {
        // ARRANGE
        Patient patient2 = Patient.builder().idPatient(2).nom("Martin").prenom("Sophie").cin("CD67890").build();
        List<Patient> patientList = Arrays.asList(patient, patient2);
        when(patientRepository.findAll()).thenReturn(patientList);

        // ACT
        List<PatientResponse> result = patientService.getAllPatients();

        // ASSERT
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Dupont", result.get(0).getNom());
        assertEquals("Martin", result.get(1).getNom());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void getRendezVousPatient() {
        // ARRANGE
        Integer patientId = 1;
        when(patientRepository.getById(patientId)).thenReturn(patient);

        // Configuration du mock WebClient
        when(webClientBuilder.build().get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(RendezVousResponse.class)).thenReturn(Mono.just(rendezVousResponse));

        // ACT
        RendezVousPatient result = patientService.getRendezVousPatient(patientId);

        // ASSERT
        assertNotNull(result);
        assertEquals(patient.getCin(), result.getCin());
        assertEquals(patient.getNom(), result.getNom());
        assertEquals(rendezVousResponse.getMotif(), result.getMotif());
        assertEquals(rendezVousResponse.getDateRdvs(), result.getDateRdvs());
        assertEquals(rendezVousResponse.getHeureDebut(), result.getHeureDebut());

        verify(patientRepository, times(1)).getById(patientId);
        verify(webClientBuilder, times(1)).build().get();
        verify(requestHeadersUriSpec, times(1)).uri(anyString(), any(Function.class));
    }

    @Test
    void getRendezVousPatient_shouldThrowException_whenPatientNotFound() {
        // ARRANGE
        Integer patientId = 999;
        // Simuler que le patient n'est pas trouvé
        when(patientRepository.getById(patientId)).thenReturn(null);

        // ACT & ASSERT
        // 1. On s'attend à ce que l'exception soit levée
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.getRendezVousPatient(patientId);
        });


        assertTrue(exception.getMessage().contains("Patient introuvable avec l'ID : " + patientId),
                "Le message d'exception ne correspond pas à l'attendu.");

        // Vérifications
        verify(patientRepository, times(1)).getById(patientId);
        verifyNoInteractions(webClientBuilder); // S'assurer que l'appel WebClient n'a pas lieu
    }


}
