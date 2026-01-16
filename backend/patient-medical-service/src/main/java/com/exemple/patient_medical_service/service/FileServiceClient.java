package com.exemple.patient_medical_service.service;

import com.exemple.patient_medical_service.dto.FileResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class FileServiceClient {

    private final WebClient.Builder fileServiceWebClientBuilder;

    // Utilisation de @Qualifier pour injecter le WebClient spécifique
    public FileServiceClient(@Qualifier("fileServiceWebClient") WebClient.Builder fileServiceWebClient) {
        this.fileServiceWebClientBuilder = fileServiceWebClient;
    }


    public Mono<FileResponse> uploadDocument(byte[] fileContent, String fileName, Long ownerId, String ownerType) {

        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        // Ajout du fichier
        builder.part("file", new ByteArrayResource(fileContent) {
            @Override
            public String getFilename() {
                return fileName;
            }
        }).contentType(MediaType.APPLICATION_OCTET_STREAM);

        // Ajout des paramètres de requête (ownerId et ownerType)
        builder.part("ownerId", ownerId.toString());
        builder.part("ownerType", ownerType);

        return fileServiceWebClientBuilder.build().post()
            .uri("/files/upload")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .body(BodyInserters.fromMultipartData(builder.build()))
            .retrieve()
            .bodyToMono(FileResponse.class);
    }


    public Mono<List<FileResponse>> listDocumentsByOwner(Long ownerId, String ownerType) {
        return fileServiceWebClientBuilder.build().get()
            .uri(uriBuilder -> uriBuilder.path("/files")
                .queryParam("ownerId", ownerId)
                .queryParam("ownerType", ownerType)
                .build())
            .retrieve()
            .bodyToFlux(FileResponse.class)
            .collectList();
    }

    public Mono<Resource> downloadDocument(String fileId) {
        return fileServiceWebClientBuilder.build().get()
            .uri("/files/{id}/download", fileId)
            .retrieve()
            .bodyToMono(Resource.class);
    }


    public Mono<Void> deleteDocument(String fileId) {
        return fileServiceWebClientBuilder.build().delete()
            .uri("/files/{id}", fileId)
            .retrieve()
            .bodyToMono(Void.class);
    }

    public Mono<FileResponse> getDocumentById(String fileId) {
        return fileServiceWebClientBuilder.build().get()
                .uri("/files/{id}", fileId)
                .retrieve()
                .bodyToMono(FileResponse.class);
    }

}
