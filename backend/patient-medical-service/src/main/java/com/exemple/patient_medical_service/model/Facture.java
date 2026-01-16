package com.exemple.patient_medical_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;


@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFacture;

    @Column(precision = 10, scale = 2)
    private BigDecimal montantTotal;

    private String modePaiement;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idConsultation", referencedColumnName = "idConsultation", unique = true)
    @JsonIgnore
    private Consultation consultation;
}
