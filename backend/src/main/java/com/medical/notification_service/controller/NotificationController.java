package com.medical.notification_service.controller;


import com.medical.notification_service.dto.NotificationDTO;
import com.medical.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/envoyer")
    public NotificationDTO envoyer(@RequestBody NotificationDTO dto) {
        return notificationService.envoyer(dto);
    }

    @GetMapping("/secretaire/{id}/non-lues")
    public List<NotificationDTO> getNonLues(@PathVariable Integer id) {
        return notificationService.getNotificationsNonLues(id);
    }

    @GetMapping("/secretaire/{id}")
    public List<NotificationDTO> getNotifications(@PathVariable Integer id) {
        return notificationService.getNotifications(id);
    }

    @PutMapping("/{id}/lue")
    public void marquerCommeLue(@PathVariable Long id) {
        notificationService.marquerCommeLue(id);
    }
}
