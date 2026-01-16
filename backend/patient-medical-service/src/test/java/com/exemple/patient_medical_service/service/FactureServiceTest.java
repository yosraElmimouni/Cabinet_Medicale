package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.*;
import com.exemple.patient_medical_service.model.Facture;
import com.exemple.patient_medical_service.model.Patient;
import com.exemple.patient_medical_service.repository.FactureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersUriSpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;
import org.springframework.web.reactive.function.client.WebClient.ResponseSpec;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FactureServiceTest {
    @Mock
    private FactureRepository factureRepository;

    @Mock
    private WebClient webClient;

    @InjectMocks
    private FactureService factureService;

    // Mocks pour la chaîne de WebClient
    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RequestHeadersSpec requestHeadersSpec;
    @Mock
    private ResponseSpec responseSpec;

    private FactureRequest factureRequest;
    private Facture facture;
    private RendezVousConsultation rvTermine;
    private RendezVousConsultation rvNonTermine;


    @BeforeEach
    void setUp() {
        // Initialisation des objets de données de test
        factureRequest = FactureRequest.builder()
                .modePaiement("paypal")
                .montantTotal(BigDecimal.valueOf(199.00))
                .build();

        facture = Facture.builder()
                .idFacture(1)
                .modePaiement("paypal")
                .montantTotal(BigDecimal.valueOf(199.00))
                .build();

    }

    @Test
    void createFacture(){
        // ACT
        factureService.createfacture(factureRequest);

        ArgumentCaptor<Facture> factureArgumentCaptor = ArgumentCaptor.forClass(Facture.class);
        verify(factureRepository, times(1)).save(factureArgumentCaptor.capture());

        Facture saverFacture = factureArgumentCaptor.getValue();
        assertEquals("paypal", saverFacture.getModePaiement());
        assertEquals(BigDecimal.valueOf(199.00), saverFacture.getMontantTotal());
    }

    @Test
    void getAllFactures(){
        Facture facture1=Facture.builder().idFacture(2).modePaiement("banque").montantTotal(BigDecimal.valueOf(399.00)).build();
        List<Facture> factureList=Arrays.asList(facture,facture1);
        when(factureRepository.findAll()).thenReturn(factureList);
        List<FactureResponse> listeresultant= factureService.getAllFactures();
        assertEquals(2,listeresultant.size());
        assertEquals("paypal",listeresultant.get(0).getModePaiement());
        assertNotNull(listeresultant);
    }

}
