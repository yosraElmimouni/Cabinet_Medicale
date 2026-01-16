package com.exemple.patient_medical_service.dto;


import com.exemple.patient_medical_service.model.DossierMedical;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientRequest {
    private String cin;
    private String nom;
    private String prenom;
    private String sexe;
    private String numTel;
    private String typeMutuelle;
    private LocalDate dateNaissance;
    private DossierMedical dossierMedical;
    private Integer idSecretaire;

}
