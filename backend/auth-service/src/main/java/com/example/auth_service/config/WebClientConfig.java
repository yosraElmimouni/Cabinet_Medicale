package com.example.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder fileWebClientBuilder() {
        return WebClient.builder()
                .baseUrl("http://localhost:8083/files") // file-service port
                ;
    }
}
