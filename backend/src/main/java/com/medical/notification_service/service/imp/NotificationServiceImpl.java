package com.medical.notification_service.service.imp;


import com.medical.notification_service.dto.NotificationDTO;
import com.medical.notification_service.model.Notification;
import com.medical.notification_service.model.TypeNotification;
import com.medical.notification_service.repository.NotificationRepository;
import com.medical.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationDTO envoyer(NotificationDTO dto) {

        Notification notif = new Notification();
        notif.setNomPatient(dto.getNomPatient());
        notif.setPrenomPatient(dto.getPrenomPatient());
        notif.setTelephonePatient(dto.getTelephonePatient());
        notif.setDateSouhaitee(dto.getDateSouhaitee());
        notif.setMotif(dto.getMotif());
        notif.setTitre(dto.getTitre());
        notif.setMessage(dto.getMessage());

        notif.setDateEnvoi(LocalDateTime.now());
        notif.setEstLue(false);


        notif.setType(dto.getType());


        notif.setSecretaireId(dto.getSecretaireId());

        Notification saved = notificationRepository.save(notif);

        dto.setIdNotification(saved.getIdNotification());
        dto.setDateEnvoi(saved.getDateEnvoi());
        dto.setEstLue(false);

        return dto;
    }

    @Override
    public List<NotificationDTO> getNotificationsNonLues(Integer secretaireId) {
        return notificationRepository.findBySecretaireIdAndEstLueFalse(secretaireId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public List<NotificationDTO> getNotifications(Integer secretaireId) {
        return notificationRepository.findBySecretaireId(secretaireId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public void marquerCommeLue(Long idNotification) {
        Notification notif = notificationRepository.findById(idNotification)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notif.setEstLue(true);
        notificationRepository.save(notif);
    }

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setIdNotification(n.getIdNotification());
        dto.setNomPatient(n.getNomPatient());
        dto.setPrenomPatient(n.getPrenomPatient());
        dto.setTelephonePatient(n.getTelephonePatient());
        dto.setDateSouhaitee(n.getDateSouhaitee());
        dto.setMotif(n.getMotif());
        dto.setTitre(n.getTitre());
        dto.setMessage(n.getMessage());
        dto.setDateEnvoi(n.getDateEnvoi());
        dto.setEstLue(n.getEstLue());

        dto.setType(n.getType());



        dto.setSecretaireId(n.getSecretaireId());
        return dto;
    }
}
