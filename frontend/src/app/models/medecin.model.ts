export interface Medecin {
  idMedecin: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  dateEmbauche: Date;
  statut: 'actif' | 'inactif' | 'congé';
  avatar?: string;
}