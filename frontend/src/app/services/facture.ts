import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface FactureRequest {
  montantTotal: number;
  modePaiement: string;
  idconsultation: number;
}

export interface FactureResponse {
  idFacture: number;
  montantTotal: number;
  modePaiement: string;
  consultation: any;
}

export interface FacturePatientResponse {
  idFacture: number;
  montantTotal: number;
  modePaiement: string;
  consultation: any;
  patient: any;
}

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiUrl = 'http://localhost:8080/api/Facture';

  constructor(private http: HttpClient) {}

  createFacture(facture: FactureRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, facture).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de la facture:', error);
        throw error;
      })
    );
  }

  getAllFactures(): Observable<FactureResponse[]> {
    return this.http.get<FactureResponse[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des factures:', error);
        throw error;
      })
    );
  }

  getFacturesBySecretaire(idSecretaire: number): Observable<FacturePatientResponse[]> {
    return this.http.get<FacturePatientResponse[]>(`${this.apiUrl}/secretaire/${idSecretaire}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des factures de la secrétaire:', error);
        throw error;
      })
    );
  }
}
