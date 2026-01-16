package com.exemple.rendezvous_service.dto;

import java.time.LocalDate;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {

    private Integer IdPatient;
    private String cin;
    private String nom;
    private String prenom;
    private String sexe;
    private String numTel;
    private String typeMutuelle;
    private LocalDate dateNaissance;
    private Integer idSecretaire;
}