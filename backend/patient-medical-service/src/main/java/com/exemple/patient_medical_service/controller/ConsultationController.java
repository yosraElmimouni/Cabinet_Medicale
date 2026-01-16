package com.exemple.patient_medical_service.controller;

import com.exemple.patient_medical_service.dto.ConsultationRequest;
import com.exemple.patient_medical_service.dto.ConsultationResponse;
import com.exemple.patient_medical_service.dto.PatientResponseDTO;
import com.exemple.patient_medical_service.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/Consultation")
@RequiredArgsConstructor
public class ConsultationController {
    private final ConsultationService ConsultationService;

    @GetMapping("/medecin/{medecinId}")
    @ResponseStatus(HttpStatus.OK)
    public List<ConsultationResponse>  getConsultationMedcin(@PathVariable Integer medecinId){
        return ConsultationService.getAllConsultationMedcin(medecinId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createConsultation(@RequestBody ConsultationRequest ConsultationRequest){
        ConsultationService.createConsultation(ConsultationRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ConsultationResponse> getAllConsultation(){
        return ConsultationService.getAllConsultation();
    }


}
