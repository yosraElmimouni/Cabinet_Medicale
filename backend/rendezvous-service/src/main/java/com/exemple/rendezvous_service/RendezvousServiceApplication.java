package com.exemple.rendezvous_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class RendezvousServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RendezvousServiceApplication.class, args);
	}

}
