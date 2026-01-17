package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.*;
import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.Facture;
import com.exemple.patient_medical_service.repository.ConsultationRepository;
import com.exemple.patient_medical_service.repository.FactureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FactureServiceTest {
    @Mock
    private FactureRepository factureRepository;

    @Mock
    private ConsultationRepository consultationRepository;

    @InjectMocks
    private FactureService factureService;

    private FactureRequest factureRequest;
    private Facture facture;
    private Consultation consultation;

    @BeforeEach
    void setUp() {
        factureRequest = FactureRequest.builder()
                .idconsultation(1)
                .modePaiement("paypal")
                .montantTotal(BigDecimal.valueOf(199.00))
                .build();

        consultation = Consultation.builder()
                .idConsultation(1)
                .build();

        facture = Facture.builder()
                .idFacture(1)
                .consultation(consultation)
                .modePaiement("paypal")
                .montantTotal(BigDecimal.valueOf(199.00))
                .build();
    }

    @Test
    void createFacture(){
        when(consultationRepository.findById(1)).thenReturn(Optional.of(consultation));

        factureService.createfacture(factureRequest);

        verify(factureRepository, times(1)).save(any(Facture.class));
    }

    @Test
    void getAllFactures(){
        Facture facture1 = Facture.builder().idFacture(2).consultation(consultation).modePaiement("banque").montantTotal(BigDecimal.valueOf(399.00)).build();
        List<Facture> factureList = Arrays.asList(facture, facture1);
        when(factureRepository.findAll()).thenReturn(factureList);

        List<FactureResponse> result = factureService.getAllFactures();

        assertEquals(2, result.size());
        verify(factureRepository, times(1)).findAll();
    }
}
