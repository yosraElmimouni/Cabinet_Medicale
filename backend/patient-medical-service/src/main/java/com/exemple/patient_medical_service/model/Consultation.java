package com.exemple.patient_medical_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idConsultation;

    private String type;
    private LocalDate dateConsultation;
    private String examenClinique;
    private String examenSupplementaire;
    private String diagnostic;
    private String traitement ;
    private String observations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idDossier", nullable = false)
    @JsonIgnore
    private DossierMedical dossierMedical;

    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Facture facture;
    private Integer idMedecin;

    @Column(unique = true)
    private Integer idRendezVous;
}
