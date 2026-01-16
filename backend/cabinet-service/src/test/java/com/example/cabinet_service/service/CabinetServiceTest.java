package com.example.cabinet_service.service;

import com.example.cabinet_service.client.FileClient;
import com.example.cabinet_service.dto.*;
import com.example.cabinet_service.model.*;
import com.example.cabinet_service.repository.CabinetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersUriSpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;
import org.springframework.web.reactive.function.client.WebClient.ResponseSpec;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CabinetServiceTest {

    @Mock
    private CabinetRepository cabinetRepository;

    @Mock
    private WebClient webClient;

    @InjectMocks
    private CabinetService cabinetService;

    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RequestHeadersSpec requestHeadersSpec;
    @Mock
    private ResponseSpec responseSpec;

    @Mock
    private FileClient fileClient;

    private Cabinet cabinet;
    private CabinetResponse cabinetResponse;
    private Cabinet cabinet2;
    private CabinetRequest cabinetRequest;
    private CreateCabinetRequest cabinetRequestCreate;

    @BeforeEach
    void setUp(){
        cabinetRequest = CabinetRequest.builder()
                .adresseCabinet("khouribga")
                .emailCabinet("yosra@gmail.com")
                .nomCabinet("cabinet dr benani")
                .teleCabinet("0675630000")
                .build();
        cabinetRequestCreate = CreateCabinetRequest.builder()
                .adresseCabinet("khouribga")
                .emailCabinet("yosra@gmail.com")
                .nomCabinet("cabinet dr benani")
                .teleCabinet("0675630000")
                .superAdminId(1L)
                .build();

        cabinet = Cabinet.builder()
                .idCabinet(1)
                .adresseCabinet("khouribga")
                .emailCabinet("yosra@gmail.com")
                .nomCabinet("cabinet dr benani")
                .teleCabinet("0675630000")
                .superAdminId(1L)
                .build();
        cabinetResponse = CabinetResponse.builder()
                .idCabinet(1)
                .adresseCabinet("khouribga")
                .emailCabinet("yosra@gmail.com")
                .nomCabinet("cabinet dr benani")
                .teleCabinet("0675630000")
                .superAdminId(1L)
                .build();
    }

    @Test
    void createCabinet(){
        cabinetService.createCabinet(cabinetRequestCreate);

        ArgumentCaptor<Cabinet> Captor = ArgumentCaptor.forClass(Cabinet.class);
        verify(cabinetRepository, times(1)).save(Captor.capture());

        Cabinet savedCabinet = Captor.getValue();
        assertEquals("khouribga", savedCabinet.getAdresseCabinet());
        assertEquals("yosra@gmail.com", savedCabinet.getEmailCabinet());
        assertEquals("0675630000", savedCabinet.getTeleCabinet());
    }

    @Test
    void getAllCabinets(){
        Cabinet cabinet2 = Cabinet.builder().idCabinet(2)
                .adresseCabinet("errach")
                .emailCabinet("oumayma@gmail.com")
                .nomCabinet("cabinet dr benani")
                .teleCabinet("0600000000")
                .superAdminId(2L)
                .build();
        List<Cabinet> CabinetList = Arrays.asList(cabinet, cabinet2);
        when(cabinetRepository.findAll()).thenReturn(CabinetList);


        List<CabinetResponse> result = cabinetService.getAllCabinet();


        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("0675630000", result.get(0).getTeleCabinet());
        assertEquals("errach", result.get(1).getAdresseCabinet());
        verify(cabinetRepository, times(1)).findAll();
    }


    @Test
    void updateCabinet_withoutLogo_success() {

        // GIVEN
        Cabinet cabinet = new Cabinet();
        cabinet.setIdCabinet(1);

        CabinetRequest cabinetRequest = CabinetRequest.builder()
                .adresseCabinet("rabat")
                .emailCabinet("imane@gmail.com")
                .nomCabinet("cabinet dr benani youssef")
                .teleCabinet("0611111111")

                .build();

        when(cabinetRepository.findById(1))
                .thenReturn(Optional.of(cabinet));

        when(cabinetRepository.save(any(Cabinet.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CabinetResponse response =
                cabinetService.updateCabinet(1, cabinetRequest, null);

        assertNotNull(response);
        assertEquals("rabat", cabinet.getAdresseCabinet());
        assertEquals("imane@gmail.com", cabinet.getEmailCabinet());
        assertEquals("cabinet dr benani youssef", cabinet.getNomCabinet());
        assertEquals("0611111111", cabinet.getTeleCabinet());

        verify(fileClient, never()).uploadFile(any(), anyInt());
        verify(cabinetRepository).save(cabinet);
    }

    @Test
    void updateCabinet_withLogo_success() {

        Cabinet cabinet = new Cabinet();
        cabinet.setIdCabinet(1);
        MultipartFile logo = mock(MultipartFile.class);
        FileResponse fileResponse = new FileResponse();
        fileResponse.setId(String.valueOf(99));

        when(cabinetRepository.findById(1)).thenReturn(Optional.of(cabinet));
        when(logo.isEmpty()).thenReturn(false);
        when(fileClient.uploadFile(logo, 1)).thenReturn(fileResponse);
        when(cabinetRepository.save(any(Cabinet.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CabinetResponse response =
                cabinetService.updateCabinet(1, cabinetRequest, logo);

        assertEquals("99", cabinet.getLogo());
        verify(fileClient).uploadFile(logo, 1);
        verify(cabinetRepository).save(cabinet);
    }

}
