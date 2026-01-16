package com.exemple.patient_medical_service.dto;

import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FacturePatientResponse {
    private Integer idFacture;
    private BigDecimal montantTotal;
    private String modePaiement;
    private Consultation consultation;
    private Patient patient;
}
