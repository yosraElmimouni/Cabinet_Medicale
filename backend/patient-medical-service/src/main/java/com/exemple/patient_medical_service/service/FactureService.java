package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.FacturePatientResponse;
import com.exemple.patient_medical_service.dto.FactureRequest;
import com.exemple.patient_medical_service.dto.FactureResponse;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.Facture;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import com.exemple.patient_medical_service.repository.FactureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FactureService {
    private final FactureRepository factureRepository;
    private final ConsultationRepository consultationRepository;

    public void createfacture(FactureRequest factureRequest){

        if (factureRequest.getIdconsultation() == null) {
            throw new IllegalArgumentException("consultationId est obligatoire");
        }

        Consultation consultation = consultationRepository.findById(factureRequest.getIdconsultation())
                .orElseThrow(() -> new RuntimeException("Consultation introuvable"));

        Facture facture = Facture.builder()
                .consultation(consultation)
                .montantTotal(factureRequest.getMontantTotal())
                .modePaiement(factureRequest.getModePaiement())
                .build();
        factureRepository.save(facture);
        log.info("facture "+facture.getIdFacture() +" saved");
    }

    public List<FactureResponse> getAllFactures(){
        List<Facture> factures = factureRepository.findAll();
        return factures.stream().map(facture -> mapTofactureResponse(facture)).toList();
    }

    public List<FacturePatientResponse> getFacturesBySecretaire(Integer idSecretaire) {
        List<Facture> factures = factureRepository.findBySecretaireId(idSecretaire);
        return factures.stream().map(this::mapToFacturePatientResponse).toList();
    }

    private FacturePatientResponse mapToFacturePatientResponse(Facture facture) {
        return FacturePatientResponse.builder()
                .idFacture(facture.getIdFacture())
                .montantTotal(facture.getMontantTotal())
                .modePaiement(facture.getModePaiement())
                .consultation(facture.getConsultation())
                .patient(facture.getConsultation().getDossierMedical().getPatient())
                .build();
    }

    private FactureResponse mapTofactureResponse(Facture facture) {
        return FactureResponse.builder()
                .idFacture(facture.getIdFacture())
                .consultation(facture.getConsultation())
                .montantTotal(facture.getMontantTotal())
                .modePaiement(facture.getModePaiement())
                .build();
    }
}
