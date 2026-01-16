package com.example.cabinet_service.model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Getter
@Setter
public class Cabinet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCabinet;

    private String logo;
    private String nomCabinet;
    private String adresseCabinet;
    private String emailCabinet;
    private String teleCabinet;
    private Long superAdminId;

}
