package com.exemple.patient_medical_service.controller;

import com.exemple.patient_medical_service.dto.DossierMedicalRequest;
import com.exemple.patient_medical_service.dto.DossierMedicalResponse;
import com.exemple.patient_medical_service.dto.ListeConsultationDossierMedicale;
import com.exemple.patient_medical_service.service.DossierMedicalService;
import com.exemple.patient_medical_service.dto.FileResponse;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*") // Ajout de l'annotation CrossOrigin pour les tests

@RequestMapping("/api/DossierMedical")
@RequiredArgsConstructor
public class DossierMedicalController {
    private final DossierMedicalService DossierMedicalService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createDossierMedical(@RequestBody DossierMedicalRequest DossierMedicalRequest){
        DossierMedicalService.createDossierMedical(DossierMedicalRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<DossierMedicalResponse> getAllDossierMedical(){
        return DossierMedicalService.getAllDossierMedical();
    }

    @GetMapping("/ConsultationsParDM")
    @ResponseStatus(HttpStatus.OK)
    public ListeConsultationDossierMedicale getConsultationsParDM(@RequestParam Integer idDM){
        return DossierMedicalService.getConsultationsParidDM(idDM);
    }

    @GetMapping("/ConsultationsParPatient")
    @ResponseStatus(HttpStatus.OK)
    public ListeConsultationDossierMedicale getConsultationsParPatient(@RequestParam Integer idPatient){
        return DossierMedicalService.getConsultationsParidPaatient(idPatient);
    }

    @GetMapping("/ConsultationsParMedcin")
    @ResponseStatus(HttpStatus.OK)
    public ListeConsultationDossierMedicale getConsultationsParidMedcin(@RequestParam Integer idMedcin){
        return DossierMedicalService.getConsultationsParidMedcin(idMedcin);
    }

    @PostMapping("/uploadDocument")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<FileResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId
    ) throws IOException {
        return DossierMedicalService.uploadDocumentForPatient(file, patientId);
    }
}
