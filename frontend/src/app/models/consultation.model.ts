export interface ConsultationRequest {
  type: string;
  dateConsultation: string;
  examenClinique: string;
  examenSupplementaire: string;
  diagnostic: string;
  traitement: string;
  observations: string;
  idDossierMedical: number;
  idMedecin: number;
  idRendezVous?: number;
}

export interface ConsultationResponse {
  idConsultation: number;
  type: string;
  dateConsultation: string;
  examenClinique: string;
  examenSupplementaire: string;
  diagnostic: string;
  traitement: string;
  observations: string;
  idDossierMedical: number;
  facture?: FactureResponse;
  idMedecin: number;
  nomMedecin?: string;
  idRendezVous?: number;
}

export interface MedicalRecordConsultationList {
  idDossier: number;
  patient: Patient;
  consultations: ConsultationResponse[];
}

export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  status: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface FactureResponse {
  idFacture: number;
  montant: number;
  statut: string;
}

export interface Consultation {
  idConsultation: number;
  type: string;
  dateConsultation: Date;
  examenClinique: string;
  examenSupplementaire: string;
  diagnostic: string;
  traitement: string;
  observations: string;
  idDossierMedical: number;
  facture?: FactureResponse;
  idMedecin: number;
  nomMedecin?: string;
  idRendezVous?: number;
}