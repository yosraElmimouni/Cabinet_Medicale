package com.exemple.patient_medical_service.repository;

import com.exemple.patient_medical_service.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient,Integer> {
    List<Patient> findByIdSecretaire(Long idSecretaire);
    Optional<Patient> findById(Integer id);
}
