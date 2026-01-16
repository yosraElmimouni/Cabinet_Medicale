package com.example.cabinet_service.client;

import com.example.cabinet_service.dto.FileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileClient {

    private final WebClient.Builder fileWebClientBuilder;

    public FileResponse uploadFile(MultipartFile file, Integer cabinetId) {

        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        builder.part("file", file.getResource())
                .filename(file.getOriginalFilename())
                .contentType(MediaType.parseMediaType(file.getContentType()));

        builder.part("ownerId", cabinetId.toString());
        builder.part("ownerType", "CABINET");

        return fileWebClientBuilder.build().post()
                .uri("/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(FileResponse.class)
                .block();
    }
}