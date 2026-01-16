package com.medical.notification_service.repository;
import  com.medical.notification_service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findBySecretaireIdAndEstLueFalse(Integer secretaireId);

    List<Notification> findBySecretaireId(Integer secretaireId);
}

