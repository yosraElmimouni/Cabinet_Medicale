package com.exemple.rendezvous_service.dto;

import java.util.List;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class RendezVousPatientMedcin {

    private PatientResponse patient;
    private List<RendezVousResponse> rendezVousResponse;
}
