package com.exemple.patient_medical_service.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class RendezVousConsultation {
    private Integer RendezVousId;
    private boolean isTerminate;
    private Integer idPatient;

}
