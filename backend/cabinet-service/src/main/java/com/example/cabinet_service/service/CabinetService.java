package com.example.cabinet_service.service;

import com.example.cabinet_service.client.FileClient;
import com.example.cabinet_service.dto.CabinetRequest;
import com.example.cabinet_service.dto.CabinetResponse;
import com.example.cabinet_service.dto.CreateCabinetRequest;
import com.example.cabinet_service.dto.FileResponse;
import com.example.cabinet_service.model.Cabinet;
import com.example.cabinet_service.repository.CabinetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CabinetService {


    private final CabinetRepository cabinetRepository;
    private final FileClient fileClient;
    public void createCabinet(CreateCabinetRequest cabinetRequest){
        Cabinet cabinet = Cabinet.builder()
                .nomCabinet(cabinetRequest.getNomCabinet())
                .adresseCabinet(cabinetRequest.getAdresseCabinet())
                .emailCabinet(cabinetRequest.getEmailCabinet())
                .teleCabinet(cabinetRequest.getTeleCabinet())
                .superAdminId(cabinetRequest.getSuperAdminId())
                .logo(null)
                .build();

        cabinetRepository.save(cabinet);
        log.info("Cabinet " + cabinet.getIdCabinet() + " saved");
    }

    public List<CabinetResponse> getAllCabinet(){
        List<Cabinet> cabinets = cabinetRepository.findAll();

        return cabinets.stream().map(cabinet -> mapToCabinetResponse(cabinet)).toList();
    }

    private CabinetResponse mapToCabinetResponse(Cabinet cabinet) {
        return CabinetResponse.builder().idCabinet(cabinet
                .getIdCabinet())
                .nomCabinet(cabinet.getNomCabinet())
                .adresseCabinet(cabinet.getAdresseCabinet())
                .emailCabinet(cabinet.getEmailCabinet())
                .logo(cabinet.getLogo())
                .teleCabinet(cabinet.getTeleCabinet())
                .superAdminId(cabinet.getSuperAdminId())
                .build();
    }

    public CabinetResponse updateCabinet(Integer id, CabinetRequest request, MultipartFile logo) {

        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet introuvable"));

        cabinet.setNomCabinet(request.getNomCabinet());
        cabinet.setAdresseCabinet(request.getAdresseCabinet());
        cabinet.setEmailCabinet(request.getEmailCabinet());
        cabinet.setTeleCabinet(request.getTeleCabinet());

        // Upload logo si présent
        if (logo != null && !logo.isEmpty()) {
            FileResponse file = fileClient.uploadFile(logo, id);
            cabinet.setLogo(file.getId()); // on stocke l'ID du fichier
        }

        cabinet = cabinetRepository.save(cabinet);

        return mapToCabinetResponse(cabinet);
    }




}
