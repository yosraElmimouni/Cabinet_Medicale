package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.*;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.DossierMedical;
import com.exemple.patient_medical_service.dto.ListeConsultationDossierMedicale;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import com.exemple.patient_medical_service.repository.DossierMedicalRepository;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.dto.ListeConsultationDossierMedicale;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersUriSpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;
import org.springframework.web.reactive.function.client.WebClient.ResponseSpec;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DossierMedicalServiceTest {

    @Mock
    private DossierMedicalRepository dossierMedicalRepository;

    @Mock
    private WebClient webClient;

    @Mock
    private FileServiceClient fileServiceClient;

    @Mock
    private PatientService patientService;

    @Mock
    private ConsultationRepository consultationRepository;


    // Mocks pour la chaîne de WebClient
    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RequestHeadersSpec requestHeadersSpec;
    @Mock
    private ResponseSpec responseSpec;

    @InjectMocks
    private DossierMedicalService dossierMedicalService;

    private DossierMedicalRequest dossierMedicalRequest;
    private DossierMedical dossierMedical;

    private Consultation consultation;
    private Patient patient;

    @BeforeEach
    void setUp() {
        // Initialisation des objets de données de test
        dossierMedicalRequest = DossierMedicalRequest.builder()
                .allergies("no allergies")
                .antChirurg("antiii")
                .antMedicaux("midicaux")
                .dateCreation(LocalDate.now().atStartOfDay())
                .idMedecin(1)
                .build();

        patient = Patient.builder()
                .idPatient(1)
                .nom("Patient")
                .prenom("Test")
                .build();

        dossierMedical = DossierMedical.builder()
                .idDossier(1)
                .idMedecin(1)
                .allergies("no allergies")
                .antChirurg("antiii")
                .antMedicaux("midicaux")
                .dateCreation(LocalDate.now().atStartOfDay())
                .build();
        dossierMedical.setPatient(patient);

        consultation = Consultation.builder()
                .idConsultation(1)
                .diagnostic("Grippe")
                .dossierMedical(dossierMedical)
                .build();

    }

    void createDossierMedical(){
        dossierMedicalService.createDossierMedical(dossierMedicalRequest);

        ArgumentCaptor<DossierMedical> dossierMedicalArgumentCaptor = ArgumentCaptor.forClass(DossierMedical.class);
        verify(dossierMedicalRepository, times(1)).save(dossierMedicalArgumentCaptor.capture());

        DossierMedical savedDossier = dossierMedicalArgumentCaptor.getValue();
        assertEquals("no allergies", savedDossier.getAllergies());
        assertEquals("midicaux", savedDossier.getAntMedicaux());
    }

    @Test
    void getAllDossiers(){
        DossierMedical dossierMedical1=DossierMedical.builder().idDossier(2).antMedicaux("hello").antChirurg("ouii").habitudes("hbitudes").build();
        List<DossierMedical> dossierMedicalList = Arrays.asList(dossierMedical,dossierMedical1);

        when(dossierMedicalRepository.findAll()).thenReturn(dossierMedicalList);

        List<DossierMedicalResponse> responseList = dossierMedicalService.getAllDossierMedical();

        assertNotNull(responseList);
        assertEquals(2,responseList.size());
        assertEquals("hello",responseList.get(1).getAntMedicaux());
    }

    @Test
    void getConsultationsParidDM() {
        // ARRANGE
        Integer idDM = 1;
        List<Consultation> consultations = List.of(consultation);

        when(consultationRepository.findByDossierMedical_IdDossier(idDM)).thenReturn(consultations);
        when(dossierMedicalRepository.findById(idDM)).thenReturn(Optional.of(dossierMedical));

        // ACT
        ListeConsultationDossierMedicale result = dossierMedicalService.getConsultationsParidDM(idDM);

        // ASSERT
        assertNotNull(result);
        assertEquals(idDM, result.getIdDossier());
        assertEquals(patient, result.getPatient());
        assertEquals(1, result.getConsultationResponsesListe().size());
        assertEquals("Grippe", result.getConsultationResponsesListe().get(0).getDiagnostic());

        verify(consultationRepository, times(1)).findByDossierMedical_IdDossier(idDM);
        verify(dossierMedicalRepository, times(1)).findById(idDM);
    }

    @Test
    void getConsultationsParidPaatient() {
        // ARRANGE
        Integer idPatient = 1;
        Integer idDM = 1;
        List<Consultation> consultations = List.of(consultation);

        when(dossierMedicalRepository.findByPatient_IdPatient(idPatient)).thenReturn(Optional.of(dossierMedical));
        when(consultationRepository.findByDossierMedical_IdDossier(idDM)).thenReturn(consultations);
        when(dossierMedicalRepository.findById(idDM)).thenReturn(Optional.of(dossierMedical));

        // ACT
        ListeConsultationDossierMedicale result = dossierMedicalService.getConsultationsParidPaatient(idPatient);

        // ASSERT
        assertNotNull(result);
        assertEquals(idDM, result.getIdDossier());
        assertEquals(patient, result.getPatient());
        assertEquals(1, result.getConsultationResponsesListe().size());

        verify(dossierMedicalRepository, times(1)).findByPatient_IdPatient(idPatient);
        verify(consultationRepository, times(1)).findByDossierMedical_IdDossier(idDM);
        verify(dossierMedicalRepository, times(1)).findById(idDM);
    }

    @Test
    void uploadDocumentForPatient() throws IOException {
        // ARRANGE
        MultipartFile mockFile = mock(MultipartFile.class);
        Long patientId = 1L;
        byte[] fileContent = "test content".getBytes();
        String fileName = "test.pdf";
        FileResponse expectedResponse = FileResponse.builder().originalFileName(fileName).url("http://file-service/test.pdf").build();

        when(mockFile.getBytes()).thenReturn(fileContent);
        when(mockFile.getOriginalFilename()).thenReturn(fileName);
        when(fileServiceClient.uploadDocument(any(), anyString(), anyLong(), anyString())).thenReturn(Mono.just(expectedResponse));

        // ACT
        Mono<FileResponse> resultMono = dossierMedicalService.uploadDocumentForPatient(mockFile, patientId);
        FileResponse result = resultMono.block();

        // ASSERT
        assertNotNull(result);
        assertEquals(expectedResponse.getOriginalFileName(), result.getOriginalFileName());
        assertEquals(expectedResponse.getUrl(), result.getUrl());

        verify(fileServiceClient, times(1)).uploadDocument(fileContent, fileName, patientId, "PATIENT");
    }

    @Test
    void getDocumentsForDossier() {
        // ARRANGE
        Integer idDossier = 1;
        Long patientId = 1L;
        List<FileResponse> expectedList = List.of(
                FileResponse.builder().originalFileName("doc1.pdf").build(),
                FileResponse.builder().originalFileName("doc2.jpg").build()
        );

        when(dossierMedicalRepository.findById(idDossier)).thenReturn(Optional.of(dossierMedical));
        when(fileServiceClient.listDocumentsByOwner(patientId, "PATIENT")).thenReturn(Mono.just(expectedList));

        // ACT
        Mono<List<FileResponse>> resultMono = dossierMedicalService.getDocumentsForDossier(idDossier);
        List<FileResponse> result = resultMono.block();

        // ASSERT
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("doc1.pdf", result.get(0).getOriginalFileName());

        verify(fileServiceClient, times(1)).listDocumentsByOwner(patientId, "PATIENT");
    }

    @Test
    void getDocumentsForDossierNotFound() {
        // ARRANGE
        Integer idDossier = 999;
        when(dossierMedicalRepository.findById(idDossier)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            dossierMedicalService.getDocumentsForDossier(idDossier).block();
        });

        assertEquals("Dossier Medical non trouvé avec l'ID: " + idDossier, exception.getMessage());
        verifyNoInteractions(fileServiceClient);
    }


}
