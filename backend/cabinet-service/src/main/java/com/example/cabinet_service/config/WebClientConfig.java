package com.example.cabinet_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;


@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder fileWebClientBuilder() {
        return WebClient.builder()
                .baseUrl("http://file-service/files") // file-service port
                ;
    }
}