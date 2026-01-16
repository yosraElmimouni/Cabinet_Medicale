package com.example.cabinet_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CabinetResponse {

    private Integer idCabinet;
    private String logo;
    private String nomCabinet;
    private String adresseCabinet;
    private String emailCabinet;
    private String teleCabinet;
    private Long superAdminId;

}
