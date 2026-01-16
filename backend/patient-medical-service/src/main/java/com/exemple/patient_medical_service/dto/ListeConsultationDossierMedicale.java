package com.exemple.patient_medical_service.dto;

import java.util.List;

import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class ListeConsultationDossierMedicale {
    private Integer idDossier;
    private Patient patient;
    private List<Consultation> consultationResponsesListe;
}
