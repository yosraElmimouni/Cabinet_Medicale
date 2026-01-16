export interface RendezVousResponse {
  idRendezVous: number;
  dateRdvs: Date;
  heureDebut: Date;
  heureFin: Date;
  statut: string;
  remarque?: string;
  motif?: string;
  idSecretaire?: number;
  idMedecin?: number;
  idConsultation?: number | null;
  idPatient?: number;
}

