package com.exemple.patient_medical_service.repository;


import com.exemple.patient_medical_service.model.Consultation;
import com.exemple.patient_medical_service.model.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical,Integer> {
    Optional<DossierMedical> findByPatient_IdPatient(Integer idPatient);

    @Query("SELECT d FROM DossierMedical d WHERE d.patient.idPatient = :idPatient")
    Optional<DossierMedical> findByPatientId(@Param("idPatient") Integer idPatient);

    Optional<DossierMedical> findByIdMedecin(Integer idMedecin);
}
