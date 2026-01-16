// src/app/services/cabinet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of} from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Cabinet {
  id: number;
  logo?: string;
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
}

export interface CabinetResponse {
  id: number;
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  logoUrl?: string;
}

export interface CreateCabinetRequest {
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
}

export interface CabinetRequest {
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
}

export interface CabinetStats {
  totalMedecins: number;
  totalSecretaires: number;
  totalPatients: number;
}

export interface CabinetFilter {
  searchTerm: string;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'ALL';
  page: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CabinetService {
  private apiUrl = 'http://localhost:8080/api/cabinet';
  private currentCabinetSubject = new BehaviorSubject<Cabinet | null>(null);
  public currentCabinet$ = this.currentCabinetSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer tous les cabinets (GET /api/cabinet)
  getAllCabinets(): Observable<Cabinet[]> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<Cabinet[]>(this.apiUrl, { headers });
    }
  
  getCabinetById(id: number): Observable<Cabinet> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<Cabinet>(`${this.apiUrl}/${id}`, { headers });
    }

  // Créer un cabinet (POST /api/cabinet) - Réservé au Super Admin
  createCabinet(cabinetData: CreateCabinetRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, cabinetData);
  }

  // Mettre à jour un cabinet (PUT /api/cabinet/{cabinetId}) - Réservé à l'Admin du cabinet
  // Utilise Multipart pour le logo et JSON pour les données (RequestPart)
  updateCabinet(id: number, request: CabinetRequest, logo?: File): Observable<CabinetResponse> {
    const formData = new FormData();
    
    // Ajouter les données JSON sous forme de Blob avec le type application/json
    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('request', jsonBlob);
    
    if (logo) {
      formData.append('logo', logo);
    }
    
    return this.http.put<CabinetResponse>(`${this.apiUrl}/${id}`, formData);
  }

  // --- Méthodes utilitaires pour l'UI ---


  searchCabinets(filter: CabinetFilter): Observable<PaginatedResponse<Cabinet>> {
    // Adaptation pour le backend si nécessaire
    return this.http.get<PaginatedResponse<Cabinet>>(`${this.apiUrl}/search`, {
      params: {
        page: filter.page.toString(),
        size: filter.itemsPerPage.toString(),
        term: filter.searchTerm
      }
    });
  }

  deleteCabinet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteLogo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/logo`);
  }
  
  setCurrentCabinet(id: number): Observable<Cabinet> {
      return of({} as Cabinet);
    }
}
