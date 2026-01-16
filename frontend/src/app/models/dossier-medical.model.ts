// ==============================
// MODÈLES PRINCIPAUX
// ==============================

export interface Patient {
  idPatient: number;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  genre: 'M' | 'F';
  telephone: string;
  email: string;
  adresse: string;
  groupeSanguin?: string;
  assuranceMedicale?: string;
  numeroAssurance?: string;
  avatar?: string;
  status?: 'actif' | 'suivi' | 'inactif';
  lastVisit?: string;
  nextAppointment?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  notes?: string;
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
  motif?: string;
  prescription?: string;
  examensDemandes?: string[];
  idMedecin: number;
  idPatient: number;
  idDossierMedical: number;
  nomMedecin?: string;
  facture?: {
    idFacture: number;
    montant: number;
    statut: string;
  };
}

export interface DossierMedical {
  idDossier?: number;
  antMedicaux: string;
  antChirurg: string;
  allergies: string;
  traitementEnCour: string;
  habitudes: string;
  dateCreation?: Date;
  documentsMedicaux: string[];
  patient?: Patient;
  idPatient?: number;
  consultations?: Consultation[];
  idMedecin: number;
  typeMutuelle?: string;
}

// ==============================
// DTOs POUR LES REQUÊTES/RÉPONSES
// ==============================

export interface DossierMedicalRequest {
  antMedicaux: string;
  antChirurg: string;
  allergies: string;
  traitementEnCour: string;
  habitudes: string;
  idMedecin: number;
  idPatient: number;
}

export interface DossierMedicalResponse {
  idDossier: number;
  antMedicaux: string;
  antChirurg: string;
  allergies: string;
  traitementEnCour: string;
  habitudes: string;
  dateCreation: Date;
  documentsMedicaux: string[];
  patient: Patient;
  consultations: Consultation[];
  idMedecin: number;
}

export interface DossierMedicalConsultationsRendezVousDTO {
  dossierMedical: DossierMedical;
  consultations: Consultation[];
  rendezVous: any[];
}

export interface MedicalRecordConsultationList {
  idDossier: number;
  patient: Patient;
  consultations: Consultation[];
}

// ==============================
// MODÈLES POUR L'INTERFACE
// ==============================

export interface DocumentMedicalUI {
  id: number;
  nom: string;
  type: 'ordonnance' | 'analyse' | 'radiologie' | 'certificat' | 'autre';
  date: Date;
  url: string;
  taille: string;
}

export interface TraitementUI {
  id: number;
  medicament: string;
  dosage: string;
  frequence: string;
}

export interface VaccinationUI {
  id: number;
  vaccin: string;
  date: Date;
  rappel?: Date;
}

// ==============================
// ÉTATS DU COMPOSANT
// ==============================

export interface DossierMedicalState {
  dossiers: DossierMedical[];
  patients: Patient[];
  selectedDossier: DossierMedical | null;
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
}