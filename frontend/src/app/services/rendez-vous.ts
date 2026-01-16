import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RendezVousResponse } from '../models/rendez-vous.model';

// Interface pour les requêtes de création/modification
export interface RendezVousRequest {
  dateRdvs: string; // Format: YYYY-MM-DD
  heureDebut: string; // Format: HH:mm
  heureFin: string; // Format: HH:mm
  statut: string;
  remarque?: string;
  motif?: string;
  idSecretaire: number;
  idMedecin: number;
  idPatient: number;
  idConsultation?: number | null;
}

// Interface pour la réponse détaillée avec informations patient
export interface PatientInfo {
  idPatient: number;
  cin: string;
  nom: string;
  prenom: string;
  sexe: string;
  numTel: string | null;
  typeMutuelle: string;
  dateNaissance: string;
  idSecretaire: number;
}

export interface ConsultationInfo {
  idConsultation: number;
  type: string;
  dateConsultation: string;
  examenClinique: string;
  examenSupplementaire: string;
  diagnostic: string;
  traitement: string;
  observations: string;
  idMedecin: number;
  idRendezVous: number | null;
}

export interface DossierMedicalInfo {
  idDossier: number;
  patient: PatientInfo;
  consultationResponsesListe: ConsultationInfo[];
}

export interface RendezVousDetailsResponse {
  consultationResponsesListe: DossierMedicalInfo;
  rendezVousResponse: RendezVousResponse[];
}

// Interface pour la réponse de terminaison de rendez-vous
export interface RendezVousConsultation {
  RendezVousId: number;
  isTerminate: boolean;
  idPatient: number;
}
export interface RendezVousPatientMedcin {
  patient: PatientInfo;
  rendezVousResponse: RendezVousResponse[];
}
@Injectable({
  providedIn: 'root',
})
export class RendezVousService {
  private apiUrl = 'http://localhost:8080/api/RendezVous';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les rendez-vous
   */
  getAllRendezVous(): Observable<RendezVousResponse[]> {
    return this.http.get<RendezVousResponse[]>(this.apiUrl).pipe(
      map(rdvs => rdvs.map(rdv => this.mapToRendezVousResponse(rdv))),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        throw error;
      })
    );
  }

  /**
   * Récupérer les rendez-vous par ID secrétaire
   */
  getRendezVousBySecretaireId(idSecretaire: number): Observable<RendezVousResponse[]> {
    const params = { id: idSecretaire.toString() };
    return this.http.get<RendezVousResponse[]>(`${this.apiUrl}/RendezVousSecritaireDetails`, { params }).pipe(
      map(rdvs => rdvs.map(rdv => this.mapToRendezVousResponse(rdv))),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous du secrétaire:', error);
        throw error;
      })
    );
  }

  /**
   * Récupérer les rendez-vous détaillés par ID secrétaire (avec informations patient)
   * Utilise le contrôleur RendezVousSecritairePatient qui retourne {patient, rendezVousResponse[]}
   */
  getRendezVousDetailsBySecretaireId(idSecretaire: number): Observable<any> {
    const params = { id: idSecretaire.toString() };
    return this.http.get<any>(`${this.apiUrl}/RendezVousSecritairePatient`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous détaillés du secrétaire:', error);
        throw error;
      })
    );
  }

  /**
   * Récupérer les rendez-vous détaillés par ID médecin (avec informations patient)
   * Utilise le contrôleur RendezVousMedcinPatient qui retourne [{patient, rendezVousResponse[]}, ...]
   */
  getRendezVousMedecinPatient(idMedecin: number): Observable<Array<{patient: PatientInfo, rendezVousResponse: RendezVousResponse[]}>> {
    const params = { id: idMedecin.toString() };
    return this.http.get<Array<{patient: PatientInfo, rendezVousResponse: RendezVousResponse[]}>>(
      `${this.apiUrl}/RendezVousMedcinPatient`, 
      { params }
    ).pipe(
      map(response => response.map(item => ({
        patient: item.patient,
        rendezVousResponse: item.rendezVousResponse.map(rdv => this.mapToRendezVousResponse(rdv))
      }))),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous du médecin:', error);
        throw error;
      })
    );
  }

  /**
   * Récupérer un rendez-vous par ID
   */
  getRendezVousById(id: number): Observable<RendezVousResponse> {
    return this.http.get<RendezVousResponse>(`${this.apiUrl}/${id}`).pipe(
      map(rdv => this.mapToRendezVousResponse(rdv)),
      catchError(error => {
        console.error('Erreur lors de la récupération du rendez-vous:', error);
        throw error;
      })
    );
  }

  /**
   * Retourne tous les rendez-vous disponibles
   */
  getRendezVousDisponibles(): Observable<RendezVousResponse[]> {
    return this.getAllRendezVous().pipe(
      map(rdvs => rdvs.filter(
        (rdv) => rdv.statut === 'Disponible' && !rdv.idConsultation))
    );
  }

  /**
   * Créer un nouveau rendez-vous
   * Le backend retourne void avec HttpStatus.CREATED (201)
   */
  createRendezVous(rdv: RendezVousRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, rdv).pipe(
      catchError(error => {
        console.error('Erreur lors de la création du rendez-vous:', error);
        throw error;
      })
    );
  }

  /**
   * Mettre à jour un rendez-vous
   */
  updateRendezVous(id: number, rdv: RendezVousRequest): Observable<RendezVousResponse> {
    return this.http.put<RendezVousResponse>(`${this.apiUrl}/${id}`, rdv).pipe(
      map(response => this.mapToRendezVousResponse(response)),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du rendez-vous:', error);
        throw error;
      })
    );
  }

  /**
   * Supprimer un rendez-vous
   */
  

  /**
   * Terminer un rendez-vous (changer le statut à TERMINE)
   * Utilise GET /termine avec le paramètre idRV
   */
  terminerRendezVous(idRV: number): Observable<RendezVousConsultation> {
    return this.http.get<RendezVousConsultation>(`${this.apiUrl}/termine`, {
      params: { idRV: idRV.toString() }
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la finalisation du rendez-vous:', error);
        throw error;
      })
    );
  }

  /**
   * Mapper la réponse de l'API vers RendezVousResponse
   * L'API peut retourner les dates en string ou null, on les convertit en Date si nécessaire
   */
  private mapToRendezVousResponse(rdv: any): RendezVousResponse {
    // Gérer les dates qui peuvent être null
    let dateRdvs: Date | null = null;
    if (rdv.dateRdvs) {
      dateRdvs = typeof rdv.dateRdvs === 'string' ? new Date(rdv.dateRdvs) : rdv.dateRdvs;
    }

    // Gérer les heures qui peuvent être null ou en format string "HH:mm:ss"
    let heureDebut: Date | null = null;
    if (rdv.heureDebut) {
      if (typeof rdv.heureDebut === 'string') {
        // Si c'est juste l'heure "HH:mm:ss" ou "HH:mm", créer une date avec cette heure
        const timeStr = rdv.heureDebut.includes('T') ? rdv.heureDebut : `2000-01-01T${rdv.heureDebut}`;
        heureDebut = new Date(timeStr);
      } else {
        heureDebut = rdv.heureDebut;
      }
    }

    let heureFin: Date | null = null;
    if (rdv.heureFin) {
      if (typeof rdv.heureFin === 'string') {
        const timeStr = rdv.heureFin.includes('T') ? rdv.heureFin : `2000-01-01T${rdv.heureFin}`;
        heureFin = new Date(timeStr);
      } else {
        heureFin = rdv.heureFin;
      }
    }

    return {
      idRendezVous: rdv.idRendezVous,
      dateRdvs: dateRdvs || new Date(), // Valeur par défaut si null
      heureDebut: heureDebut || new Date(), // Valeur par défaut si null
      heureFin: heureFin || new Date(), // Valeur par défaut si null
      statut: rdv.statut || '',
      remarque: rdv.remarque || '',
      motif: rdv.motif || '',
      idSecretaire: rdv.idSecretaire,
      idMedecin: rdv.idMedecin,
      idConsultation: rdv.idConsultation,
      idPatient: rdv.idPatient
    };
  }
   getRendezVousMedecinPatient1(idMedecin: number): Observable<RendezVousPatientMedcin[]> {
    const params = { id: idMedecin.toString() };
    return this.http.get<any[]>(`${this.apiUrl}/RendezVousMedcinPatient`, { params }).pipe(
      map(response => response.map(item => ({
        patient: item.patient,
        rendezVousResponse: item.rendezVousResponse.map((rdv: any) => this.mapToRendezVousResponse(rdv))
      }))),
      catchError(error => {
        console.error('Erreur lors de la récupération des rendez-vous du médecin:', error);
        throw error;
      })
    );
  }


  deleteRendezVous(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  
 
}
