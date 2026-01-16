package com.exemple.patient_medical_service.controller;

import com.exemple.patient_medical_service.dto.FacturePatientResponse;
import com.exemple.patient_medical_service.dto.FactureRequest;
import com.exemple.patient_medical_service.dto.FactureResponse;
import com.exemple.patient_medical_service.service.FactureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/Facture")
@RequiredArgsConstructor
public class FactureController {
    private final FactureService FactureService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createFacture(@RequestBody FactureRequest FactureRequest){
        FactureService.createfacture(FactureRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<FactureResponse> getAllFacture(){
        return FactureService.getAllFactures();
    }

    @GetMapping("/secretaire/{idSecretaire}")
    @ResponseStatus(HttpStatus.OK)
    public List<FacturePatientResponse> getFacturesBySecretaire(@PathVariable Integer idSecretaire) {
        return FactureService.getFacturesBySecretaire(idSecretaire);
    }
}
