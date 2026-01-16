package com.exemple.patient_medical_service.controller;

import com.exemple.patient_medical_service.dto.PatientRequest;
import com.exemple.patient_medical_service.dto.PatientResponse;
import com.exemple.patient_medical_service.dto.PatientResponseDTO;
import com.exemple.patient_medical_service.dto.RendezVousPatient;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.security.JWTService;
import com.exemple.patient_medical_service.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/Patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService PatientService;
    private final JWTService jwtService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createPatient(@RequestBody PatientRequest PatientRequest){
        PatientService.createPatient(PatientRequest);
    }



    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PatientResponse> getAllPatient(){
        return PatientService.getAllPatients();
    }

    @GetMapping("/RendezVous")
    @ResponseStatus(HttpStatus.OK)
    public RendezVousPatient getRendezVousPatient(@RequestParam Integer idPatient){
        return PatientService.getRendezVousPatient(idPatient);

    }
    @GetMapping("/Patient")
    @ResponseStatus(HttpStatus.OK)
    public PatientResponseDTO getPatient(@RequestParam Integer idPatient){
        return PatientService.getById(idPatient);

    }

    @GetMapping("/patients")
    public List<PatientResponse> getPatients(
            @RequestHeader(value = "X-Auth-UserId", required = false) String userIdHeader,
            @RequestHeader(value = "X-Auth-Roles") String role
    ) {
        System.out.println(userIdHeader);
        Long userId = null;
        if (userIdHeader != null && !userIdHeader.equals("null")) {
            userId = Long.parseLong(userIdHeader);
        }

        if ("SECRETAIRE".equals(role)) {
            if (userId == null) {
                throw new RuntimeException("userId manquant pour la secrétaire");
            }
            return PatientService.getPatientsBySecretaire(userId);
        }

        if ("ADMIN_CABINET".equals(role)) {
            return PatientService.getAllPatients();
        }

        throw new RuntimeException("Accès interdit");
    }




}
