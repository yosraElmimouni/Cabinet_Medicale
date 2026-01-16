import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Patient } from '../models/patient.model';
import { DossierMedical } from '../models/dossier-medical.model';

// Interface correspondant à votre modèle Java
export interface PatientRequest {
  cin: string;
  nom: string;
  prenom: string;
  sexe: string;
  numTel: string;
  typeMutuelle: string;
  dateNaissance: string;
  idSecretaire: number;
}

export interface PatientResponse {
  idPatient: number;
  cin: string;
  nom: string;
  prenom: string;
  sexe: string; // HOMME ou FEMME
  numTel: string | null;
  typeMutuelle: string;
  dateNaissance: string;
  dossierMedical?: DossierMedical | null;
  idSecretaire: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8080/api/Patient';

  constructor(private http: HttpClient) {}

  // ==================== CRUD Operations ====================

  // Récupérer tous les patients
  getAllPatients(): Observable<PatientResponse[]> {
    return this.http.get<PatientResponse[]>(`${this.apiUrl}/patients`).pipe(
      catchError(this.handleError<PatientResponse[]>('getAllPatients', []))
    );
  }

  // Récupérer un patient par ID
  getPatientById(id: number): Observable<Patient> {
    return this.http.get<PatientResponse>(`${this.apiUrl}/${id}`).pipe(
      map(p => this.mapToPatient(p)),
      catchError(this.handleError<Patient>('getPatientById'))
    );
  }

  // Récupérer un patient par CIN
  getPatientByCin(cin: string): Observable<Patient> {
    return this.http.get<PatientResponse>(`${this.apiUrl}/cin/${cin}`).pipe(
      map(p => this.mapToPatient(p)),
      catchError(this.handleError<Patient>('getPatientByCin'))
    );
  }

  // Rechercher des patients par nom ou prénom
  searchPatients(query: string): Observable<Patient[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<PatientResponse[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(patients => patients.map(p => this.mapToPatient(p))),
      catchError(this.handleError<Patient[]>('searchPatients', []))
    );
  }

  // Filtrer les patients par sexe
  getPatientsBySexe(sexe: string): Observable<Patient[]> {
    return this.http.get<PatientResponse[]>(`${this.apiUrl}/sexe/${sexe}`).pipe(
      map(patients => patients.map(p => this.mapToPatient(p))),
      catchError(this.handleError<Patient[]>('getPatientsBySexe', []))
    );
  }

  // Créer un nouveau patient
  createPatient(patient: PatientRequest): Observable<PatientResponse> {
    return this.http.post<PatientResponse>(`${this.apiUrl}`, patient).pipe(
      catchError(this.handleError<PatientResponse>('createPatient'))
    );
  }

  // Mettre à jour un patient
  updatePatient(id: number, patient: PatientRequest): Observable<PatientResponse> {
    return this.http.put<PatientResponse>(`${this.apiUrl}/patients/${id}`, patient).pipe(
      catchError(this.handleError<PatientResponse>('updatePatient'))
    );
  }

  // Supprimer un patient
  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/patients/${id}`).pipe(
      catchError(this.handleError<void>('deletePatient'))
    );
  }

  // Récupérer le dossier médical d'un patient
  getPatientDossierMedical(id: number): Observable<DossierMedical | null> {
    return this.http.get<DossierMedical>(`${this.apiUrl}/${id}/dossier`).pipe(
      catchError(this.handleError<DossierMedical | null>('getPatientDossierMedical', null))
    );
  }

  // Récupérer les statistiques des patients
  getPatientStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError<any>('getPatientStats', {}))
    );
  }

  // ==================== Helper Methods ====================

  private mapToPatient(response: PatientResponse): Patient {
    const dossierMedical = response.dossierMedical || undefined;
    return {
      id: response.idPatient,
      name: `${response.prenom} ${response.nom}`,
      age: this.calculateAge(new Date(response.dateNaissance)),
      gender: response.sexe === 'M' ? 'Masculin' : 'Féminin',
      lastVisit: this.getLastVisitDate(dossierMedical),
      nextAppointment: this.getNextAppointmentDate(),
      status: this.determineStatus(dossierMedical?.dateCreation),
      avatar: this.generateAvatar(response.nom, response.prenom),
      phone: response.numTel || '',
      email: this.generateEmail(response.prenom, response.nom),
      bloodGroup: this.getRandomBloodGroup(),
      allergies: this.extractAllergies(dossierMedical),
      chronicDiseases: this.extractChronicDiseases(dossierMedical),
      notes: '',
      dossierMedical: dossierMedical
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private generateAvatar(nom: string, prenom: string): string {
    const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    // Pour la simulation, retourner une URL d'avatar par défaut
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=100`;
  }

  private determineStatus(lastVisitDate?: Date): 'actif' | 'suivi' | 'inactif' {
    if (!lastVisitDate) return 'inactif';
    
    const now = new Date();
    const diffMonths = (now.getFullYear() - lastVisitDate.getFullYear()) * 12 + 
                      (now.getMonth() - lastVisitDate.getMonth());
    
    if (diffMonths < 3) return 'actif';
    if (diffMonths < 6) return 'suivi';
    return 'inactif';
  }

  private getLastVisitDate(dossierMedical?: DossierMedical): string {
    if (!dossierMedical || !dossierMedical.dateCreation) {
      return 'Jamais';
    }
    
    const lastVisit = new Date(dossierMedical.dateCreation);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  }

  private getNextAppointmentDate(): string {
    // Pour la simulation, générer une date aléatoire dans le futur
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return nextMonth.toISOString().split('T')[0];
  }

  private generateEmail(prenom: string, nom: string): string {
    return `${prenom.toLowerCase()}.${nom.toLowerCase()}@example.com`;
  }

  private getRandomBloodGroup(): string {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return groups[Math.floor(Math.random() * groups.length)];
  }

  private extractAllergies(dossierMedical?: DossierMedical): string[] {
    if (!dossierMedical?.allergies) return [];
    return dossierMedical.allergies.split(';').map(a => a.trim()).filter(a => a);
  }

  private extractChronicDiseases(dossierMedical?: DossierMedical): string[] {
    if (!dossierMedical?.antMedicaux) return [];
    // Simplification - dans une vraie app, vous auriez une logique plus complexe
    return dossierMedical.antMedicaux.split(',').map(d => d.trim()).filter(d => d);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // En production, vous pourriez envoyer l'erreur à un service de logging
      return of(result as T);
    };
  }
}