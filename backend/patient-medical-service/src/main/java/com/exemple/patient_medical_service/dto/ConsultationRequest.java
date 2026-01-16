package com.exemple.patient_medical_service.dto;

import com.exemple.patient_medical_service.model.DossierMedical;
import com.exemple.patient_medical_service.model.Facture;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsultationRequest {
    private String type;
    private LocalDate dateConsultation;
    private String examenClinique;
    private String examenSupplementaire;
    private String diagnostic;
    private String traitement;
    private String observations;
    private DossierMedical dossierMedical;
    private Facture facture;
    private Integer idMedecin;
    private Integer idRendezVous;

}
