import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  ConsultationRequest, 
  ConsultationResponse, 
  MedicalRecordConsultationList,
  Consultation
} from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  // Mise à jour de l'URL pour correspondre au contrôleur spécifié dans le fichier desc
  private apiUrl = 'http://localhost:8080/api/Consultation';

  constructor(private http: HttpClient) {}

  // ==================== CRUD Operations ====================

  getAllConsultations(): Observable<Consultation[]> {
    return this.http.get<ConsultationResponse[]>(this.apiUrl).pipe(
      map(consultations => consultations.map(c => this.mapToConsultation(c))),
      catchError(this.handleError<Consultation[]>('getAllConsultations', []))
    );
  }

  getConsultationById(id: number): Observable<Consultation> {
    return this.http.get<ConsultationResponse>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.mapToConsultation(c)),
      catchError(this.handleError<Consultation>('getConsultationById'))
    );
  }

  getConsultationsByPatient(patientId: number): Observable<Consultation[]> {
    return this.http.get<ConsultationResponse[]>(`${this.apiUrl}/patient/${patientId}`).pipe(
      map(consultations => consultations.map(c => this.mapToConsultation(c))),
      catchError(this.handleError<Consultation[]>('getConsultationsByPatient', []))
    );
  }

  getConsultationsByMedecin(medecinId: number): Observable<Consultation[]> {
    return this.http.get<ConsultationResponse[]>(`${this.apiUrl}/medecin/${medecinId}`).pipe(
      map(consultations => consultations.map(c => this.mapToConsultation(c))),
      catchError(this.handleError<Consultation[]>('getConsultationsByMedecin', []))
    );
  }

  getConsultationsByDossierMedical(dossierId: number): Observable<Consultation[]> {
    return this.http.get<ConsultationResponse[]>(`${this.apiUrl}/dossier/${dossierId}`).pipe(
      map(consultations => consultations.map(c => this.mapToConsultation(c))),
      catchError(this.handleError<Consultation[]>('getConsultationsByDossierMedical', []))
    );
  }

  getMedicalRecordWithConsultations(dossierId: number): Observable<MedicalRecordConsultationList> {
    return this.http.get<MedicalRecordConsultationList>(`${this.apiUrl}/dossier-complet/${dossierId}`).pipe(
      catchError(this.handleError<MedicalRecordConsultationList>('getMedicalRecordWithConsultations'))
    );
  }

  createConsultation(consultation: ConsultationRequest): Observable<void> {
    // Le contrôleur retourne void avec un statut CREATED
    return this.http.post<void>(this.apiUrl, consultation).pipe(
      catchError(this.handleError<void>('createConsultation'))
    );
  }

  updateConsultation(id: number, consultation: ConsultationRequest): Observable<Consultation> {
    return this.http.put<ConsultationResponse>(`${this.apiUrl}/${id}`, consultation).pipe(
      map(c => this.mapToConsultation(c)),
      catchError(this.handleError<Consultation>('updateConsultation'))
    );
  }

  deleteConsultation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<void>('deleteConsultation'))
    );
  }

  // ==================== Helper Methods ====================

  private mapToConsultation(response: ConsultationResponse): Consultation {
    return {
      idConsultation: response.idConsultation,
      type: response.type,
      dateConsultation: new Date(response.dateConsultation + 'T00:00:00'),
      examenClinique: response.examenClinique || '',
      examenSupplementaire: response.examenSupplementaire || '',
      diagnostic: response.diagnostic || '',
      traitement: response.traitement || '',
      observations: response.observations || '',
      idDossierMedical: response.idDossierMedical,
      facture: response.facture,
      idMedecin: response.idMedecin,
      nomMedecin: response.nomMedecin,
      idRendezVous: response.idRendezVous
    };
  }

  createConsultationRequest(consultation: Consultation): ConsultationRequest {
    return {
      type: consultation.type,
      dateConsultation: consultation.dateConsultation.toISOString().split('T')[0],
      examenClinique: consultation.examenClinique,
      examenSupplementaire: consultation.examenSupplementaire,
      diagnostic: consultation.diagnostic,
      traitement: consultation.traitement,
      observations: consultation.observations,
      idDossierMedical: consultation.idDossierMedical,
      idMedecin: consultation.idMedecin,
      idRendezVous: consultation.idRendezVous
    };
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

  getConsultationTypes(): string[] {
    return [
      'Consultation générale',
      'Consultation spécialisée',
      'Consultation d\'urgence',
      'Suivi post-opératoire',
      'Examen annuel',
      'Contrôle',
      'Vaccination',
      'Bilan de santé',
      'Consultation préopératoire',
      'Consultation de suivi'
    ];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long'
    });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  createEmptyConsultationRequest(dossierId: number, medecinId: number): ConsultationRequest {
    return {
      type: '',
      dateConsultation: new Date().toISOString().split('T')[0],
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: '',
      idDossierMedical: dossierId,
      idMedecin: medecinId
    };
  }
}
