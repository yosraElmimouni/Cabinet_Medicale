package com.exemple.rendezvous_service.dto;

import com.exemple.rendezvous_service.model.StatutRendezVous;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RendezVousResponse {
    private Integer idRendezVous;
    private LocalDate dateRdvs;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private StatutRendezVous statut;
    private String remarque;
    private String motif;
    private Integer idSecretaire;
    private Integer idMedecin;
    private Integer idConsultation;
    private Integer idPatient;
}
