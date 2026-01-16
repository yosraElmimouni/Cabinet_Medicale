package com.exemple.patient_medical_service.dto;


import com.exemple.patient_medical_service.model.DossierMedical;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class RendezVousPatient {
    private LocalDate dateRdvs;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String statut;
    private String remarque;
    private String motif;
    private Integer idSecretaire;
    private Integer idMedecin;
    private Integer idConsultation;
    private String cin;
    private String nom;
    private String prenom;
    private String sexe;
    private String numTel;
    private String typeMutuelle;
    private LocalDate dateNaissance;
    private DossierMedical dossierMedical;
}
