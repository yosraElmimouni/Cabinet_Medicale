package com.exemple.patient_medical_service.dto;

import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DossierMedicalRequest {
    private String antMedicaux;
    private String antChirurg;
    private String allergies;
    private String traitementEnCour;
    private String habitudes;
    private LocalDateTime dateCreation;
    private List<String> documentsMedicaux;
    private Integer patientId;
    private List<Consultation> consultations;
    private Integer idMedecin;
}
