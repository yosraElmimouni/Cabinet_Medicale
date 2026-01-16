package com.exemple.rendezvous_service.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponseDTO {

    private Integer idConsultation;
    private String type;
    private LocalDate dateConsultation;
    private String examenClinique;
    private String examenSupplementaire;
    private String diagnostic;
    private String traitement;
    private String observations;
    private Integer idMedecin;
    private Integer idRendezVous;
}
