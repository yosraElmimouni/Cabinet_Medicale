package com.exemple.rendezvous_service.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalConsultationsDTO {

    private Integer idDossier;
    private PatientDTO patient;
    private List<ConsultationResponseDTO> consultationResponsesListe;

}

