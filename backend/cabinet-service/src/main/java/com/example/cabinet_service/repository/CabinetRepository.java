package com.example.cabinet_service.repository;

import com.example.cabinet_service.model.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CabinetRepository extends JpaRepository<Cabinet,Integer> {

}
