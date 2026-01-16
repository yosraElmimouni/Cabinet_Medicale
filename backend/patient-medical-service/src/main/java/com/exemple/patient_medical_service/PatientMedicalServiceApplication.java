package com.exemple.patient_medical_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PatientMedicalServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PatientMedicalServiceApplication.class, args);
    }
}
