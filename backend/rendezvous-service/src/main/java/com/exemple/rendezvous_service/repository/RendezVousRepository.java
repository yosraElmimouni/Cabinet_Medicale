package com.exemple.rendezvous_service.repository;

import com.exemple.rendezvous_service.dto.RendezVousResponse;
import com.exemple.rendezvous_service.model.RendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous,Integer> {
    public List<RendezVous> findByIdPatient(Integer idPatient);
    public List<RendezVous> findByIdSecretaire(Integer idSecretaire);
    public List<RendezVous> findByIdMedecin(Integer idMedecin);
}
