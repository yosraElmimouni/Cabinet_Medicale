package com.medical.notification_service.dto;


import com.medical.notification_service.model.TypeNotification;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data

public class NotificationDTO {

    private Long idNotification;

    private String nomPatient;
    private String prenomPatient;
    private String telephonePatient;

    //private Integer cabinetId;
    //private Integer medecinId;

    private LocalDate dateSouhaitee;
    private String motif;

    private String titre;
    private String message;

    private LocalDateTime dateEnvoi;
    private Boolean estLue;

    private TypeNotification type;

    private Integer secretaireId;
}
