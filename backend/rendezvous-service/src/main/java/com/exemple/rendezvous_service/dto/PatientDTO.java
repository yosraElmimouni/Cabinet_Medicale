package com.exemple.rendezvous_service.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Integer idPatient;
    private String cin;
    private String nom;
    private String prenom;
    private String sexe;
    private String numTel;
    private String typeMutuelle;
    private LocalDate dateNaissance;
    private Integer idSecretaire;
}
