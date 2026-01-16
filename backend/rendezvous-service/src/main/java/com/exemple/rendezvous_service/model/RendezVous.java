package com.exemple.rendezvous_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalTime;


@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Getter
@Setter
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRendezVous;

    private LocalDate dateRdvs;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    @Enumerated(EnumType.STRING)
    private StatutRendezVous statut;

    private String remarque;

    private String motif;

    private Integer idSecretaire;
    private Integer idMedecin;
    private Integer idConsultation;
    private Integer idPatient;


}
