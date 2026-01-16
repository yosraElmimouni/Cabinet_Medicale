package com.exemple.rendezvous_service.dto;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalConsultationsRendezVousDTO {


    private DossierMedicalConsultationsDTO consultationResponsesListe;
    private List<RendezVousResponse> rendezVousResponse;
}
