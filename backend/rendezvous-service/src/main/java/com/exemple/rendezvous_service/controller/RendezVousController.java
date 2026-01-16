package com.exemple.rendezvous_service.controller;

import com.exemple.rendezvous_service.dto.*;
import com.exemple.rendezvous_service.service.RendezVousService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/RendezVous")
@RequiredArgsConstructor
public class RendezVousController {
    private final RendezVousService rendezVousService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createRendezVous(@RequestBody RendezVousRequest rendezVousRequest){
        rendezVousService.createRendezVous(rendezVousRequest);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<RendezVousResponse> getAllRendezVous(){
        return rendezVousService.getAllRendezVouss();
    }

    @GetMapping("/termine")
    @ResponseStatus(HttpStatus.OK)
    public RendezVousConsultation isTermine(@RequestParam Integer idRV) {
        return rendezVousService.isTerminate(idRV);
    }


    @GetMapping("/termineMedcin")
    @ResponseStatus(HttpStatus.OK)
    public RendezVousConsultation isTermineM(@RequestParam Integer idRV) {
        return rendezVousService.isTerminateMedcin(idRV);
    }

    @GetMapping("/idPatient")
    @ResponseStatus(HttpStatus.OK)
    public List<RendezVousResponse> getById(@RequestParam Integer idPatient){
        return rendezVousService.getByIdPatient(idPatient);
    }

    @GetMapping("/DetailleConsultationIdPatiznt")
    @ResponseStatus(HttpStatus.OK)
    public DossierMedicalConsultationsRendezVousDTO getByIdPatientDetailleParidPatent(@RequestParam Integer idPatient){
        return rendezVousService.getByIdPatientDetaille(idPatient);
    }

    @GetMapping("/DetailleConsultationIdRendezVous")
    @ResponseStatus(HttpStatus.OK)
    public DossierMedicalConsultationsRendezVousDTO getByIdPatientDetailleParIdRendezVous(@RequestParam Integer idRV){
        return rendezVousService.getByIdPatientDetailleParid(idRV);
    }

    @GetMapping("/RendezVousSecritaire")
    @ResponseStatus(HttpStatus.OK)
    public List<RendezVousResponse> getByIdSecritaireRendezVous(@RequestParam Integer id){
        return rendezVousService.findByIdSecretaire(id);
    }

    @GetMapping("/RendezVousSecritaireDetails")
    @ResponseStatus(HttpStatus.OK)
    public List<DossierMedicalConsultationsRendezVousDTO> getByIdSecretaireDetaille(@RequestParam Integer id){
        return rendezVousService.getByIdSecretaireDetaille(id);
    }

    @GetMapping("/RendezVousSecritairePatient")
    @ResponseStatus(HttpStatus.OK)
    public List<RendezVousPatientMedcin> getByIdSecretaire(@RequestParam Integer id){
        return rendezVousService.getByIdSecretaire(id);
    }

    @GetMapping("/RendezVousMedcinPatient")
    @ResponseStatus(HttpStatus.OK)
    public List<RendezVousPatientMedcin> getByIdMedcin(@RequestParam Integer id){
        return rendezVousService.getByIdMedcin(id);
    }

}
