package com.exemple.patient_medical_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DossierMedical {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDossier;

    private String antMedicaux;
    private String antChirurg;
    private String allergies;
    private String traitementEnCour;
    private String habitudes;
    private LocalDateTime dateCreation;

    @ElementCollection
    @CollectionTable(name="documents_medicaux", joinColumns=@JoinColumn(name="idDossier"))
    @Column(name="document_url")
    private List<String> documentsMedicaux;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", referencedColumnName = "idPatient", unique = true, nullable = false)
    @JsonIgnore
    private Patient patient;

    @OneToMany(
            mappedBy = "dossierMedical",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<Consultation> consultations;

    private Integer idMedecin;

}
