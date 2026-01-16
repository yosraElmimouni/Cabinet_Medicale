package com.exemple.patient_medical_service.repository;

import com.exemple.patient_medical_service.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation,Integer> {
    List<Consultation> findByDossierMedical_IdDossier(Integer idDossier);
    List<Consultation> findByIdMedecin(Integer idMedecin);

}
