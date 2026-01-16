package com.exemple.patient_medical_service.repository;

import com.exemple.patient_medical_service.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FactureRepository extends JpaRepository<Facture,Integer> {
    @Query("SELECT f FROM Facture f " +
           "JOIN f.consultation c " +
           "JOIN c.dossierMedical d " +
           "JOIN d.patient p " +
           "WHERE p.idSecretaire = :idSecretaire")
    List<Facture> findBySecretaireId(@Param("idSecretaire") Integer idSecretaire);
}
