import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  DossierMedical, 
  DossierMedicalRequest, 
  DossierMedicalResponse,
  DossierMedicalConsultationsRendezVousDTO 
} from '../models/dossier-medical.model';

@Injectable({
  providedIn: 'root'
})
export class DossierMedicalService {
  private apiUrl = 'http://localhost:8080/api/DossierMedical';

  constructor(private http: HttpClient) {}

  // ==============================
  // CRUD BASIQUE
  // ==============================

  getDossierById(id: number): Observable<DossierMedicalResponse> {
    return this.http.get<DossierMedicalResponse>(`${this.apiUrl}/${id}`);
  }

  getDossierByPatientId(patientId: number): Observable<DossierMedicalResponse> {
    return this.http.get<DossierMedicalResponse>(`${this.apiUrl}/patient/${patientId}`);
  }

  createDossier(dossier: DossierMedicalRequest): Observable<DossierMedicalResponse> {
    return this.http.post<DossierMedicalResponse>(this.apiUrl, dossier);
  }

  updateDossier(id: number, dossier: DossierMedicalRequest): Observable<DossierMedicalResponse> {
    return this.http.put<DossierMedicalResponse>(`${this.apiUrl}/${id}`, dossier);
  }

  deleteDossier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==============================
  // DONNÉES COMPLÈTES
  // ==============================

  getDossierComplet(patientId: number): Observable<DossierMedicalConsultationsRendezVousDTO> {
    return this.http.get<DossierMedicalConsultationsRendezVousDTO>(
      `${this.apiUrl}/complet/${patientId}`
    );
  }

  getDossiersByMedecin(medecinId: number): Observable<DossierMedicalResponse[]> {
    return this.http.get<DossierMedicalResponse[]>(`${this.apiUrl}/medecin/${medecinId}`);
  }

  // ==============================
  // GESTION DES DOCUMENTS
  // ==============================

  uploadDocument(dossierId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.apiUrl}/${dossierId}/documents`, formData);
  }

  deleteDocument(dossierId: number, documentUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dossierId}/documents`, {
      params: { url: documentUrl }
    });
  }

  // ==============================
  // STATISTIQUES
  // ==============================

  getStatistiques(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques`);
  }

  // ==============================
  // RECHERCHE
  // ==============================

  searchDossiers(criteria: any): Observable<DossierMedicalResponse[]> {
    return this.http.post<DossierMedicalResponse[]>(`${this.apiUrl}/search`, criteria);
  }
}