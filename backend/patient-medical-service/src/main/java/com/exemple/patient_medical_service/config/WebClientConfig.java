package com.exemple.patient_medical_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder(){
        return  WebClient.builder();
    }

    @Bean(name = "fileServiceWebClient")
    public WebClient.Builder fileServiceWebClientBuilder(WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .baseUrl("http://file-service" )
                ;
    }
}
