package com.medical.notification_service.service;



import com.medical.notification_service.model.Notification;
import com.medical.notification_service.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import com.medical.notification_service.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {

    NotificationDTO envoyer(NotificationDTO dto);

    List<NotificationDTO> getNotificationsNonLues(Integer secretaireId);

    List<NotificationDTO> getNotifications(Integer secretaireId);

    void marquerCommeLue(Long idNotification);
}
