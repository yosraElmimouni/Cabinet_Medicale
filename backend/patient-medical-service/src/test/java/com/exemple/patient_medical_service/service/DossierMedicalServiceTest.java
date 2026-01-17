package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.*;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.DossierMedical;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import com.exemple.patient_medical_service.repository.DossierMedicalRepository;
import com.exemple.patient_medical_service.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DossierMedicalServiceTest {

    @Mock
    private DossierMedicalRepository dossierMedicalRepository;

    @Mock
    private FileServiceClient fileServiceClient;

    @Mock
    private ConsultationRepository consultationRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientService patientService;

    @Mock
    private org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder;

    @InjectMocks
    private DossierMedicalService dossierMedicalService;

    private DossierMedicalRequest dossierMedicalRequest;
    private DossierMedical dossierMedical;
    private Consultation consultation;
    private Patient patient;

    @BeforeEach
    void setUp() {
        dossierMedicalRequest = DossierMedicalRequest.builder()
                .patientId(1)
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
                .patient(patient)
                .build();

        consultation = Consultation.builder()
                .idConsultation(1)
                .diagnostic("Grippe")
                .dossierMedical(dossierMedical)
                .build();
    }

    @Test
    void createDossierMedical(){
        when(patientRepository.findById(1)).thenReturn(Optional.of(patient));
        dossierMedicalService.createDossierMedical(dossierMedicalRequest);
        verify(dossierMedicalRepository, times(1)).save(any(DossierMedical.class));
    }

    @Test
    void getAllDossiers(){
        DossierMedical dossierMedical1 = DossierMedical.builder().idDossier(2).antMedicaux("hello").build();
        List<DossierMedical> dossierMedicalList = Arrays.asList(dossierMedical, dossierMedical1);
        when(dossierMedicalRepository.findAll()).thenReturn(dossierMedicalList);

        List<DossierMedicalResponse> responseList = dossierMedicalService.getAllDossierMedical();

        assertEquals(2, responseList.size());
        verify(dossierMedicalRepository, times(1)).findAll();
    }

    @Test
    void getConsultationsParidDM() {
        Integer idDM = 1;
        when(consultationRepository.findByDossierMedical_IdDossier(idDM)).thenReturn(List.of(consultation));
        when(dossierMedicalRepository.findById(idDM)).thenReturn(Optional.of(dossierMedical));

        ListeConsultationDossierMedicale result = dossierMedicalService.getConsultationsParidDM(idDM);

        assertNotNull(result);
        assertEquals(idDM, result.getIdDossier());
        verify(consultationRepository, times(1)).findByDossierMedical_IdDossier(idDM);
    }

    @Test
    void uploadDocumentForPatient() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        Long patientId = 1L;
        byte[] fileContent = "test content".getBytes();
        String fileName = "test.pdf";
        FileResponse expectedResponse = FileResponse.builder().originalFileName(fileName).url("http://file-service/test.pdf").build();

        when(mockFile.getBytes()).thenReturn(fileContent);
        when(mockFile.getOriginalFilename()).thenReturn(fileName);
        when(fileServiceClient.uploadDocument(any(), anyString(), anyLong(), anyString())).thenReturn(Mono.just(expectedResponse));

        Mono<FileResponse> resultMono = dossierMedicalService.uploadDocumentForPatient(mockFile, patientId);
        FileResponse result = resultMono.block();

        assertNotNull(result);
        assertEquals(fileName, result.getOriginalFileName());
    }
}
