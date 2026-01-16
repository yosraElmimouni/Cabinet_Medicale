import { DossierMedical } from './dossier-medical.model';

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'actif' | 'suivi' | 'inactif';
  avatar: string;
  phone: string;
  email: string;
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  notes: string;
  dossierMedical?: DossierMedical; // Ajouter cette ligne
   // Si vous avez besoin de l'ID du patient, ajoutez
  idPatient?: number;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  
}