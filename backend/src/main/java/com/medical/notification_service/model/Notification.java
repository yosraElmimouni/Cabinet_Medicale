package com.medical.notification_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idNotification;

    private String nomPatient;
    private String prenomPatient;
    private String telephonePatient;

    //private Integer cabinetId;
   // private Integer medecinId;

    private LocalDate dateSouhaitee;
    private String motif;

    private String titre;

    @Column(length = 2000)
    private String message;

    private LocalDateTime dateEnvoi;
    private Boolean estLue;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TypeNotification type;

    private Integer secretaireId;
}
