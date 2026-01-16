package com.example.auth_service.repository;

import com.example.auth_service.model.RoleUser;
import com.example.auth_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLogin(String login);

    boolean existsByLogin(String login);

    List<User> findByCabinetId(Long cabinetId);

    List<User> findByCabinetIdAndRole(Long cabinetId, RoleUser role);


}
