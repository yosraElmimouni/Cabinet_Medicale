import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interface pour la réponse de l'API utilisateur
export interface UserResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numTel: string;
  role: string; // Peut être un enum RoleUser côté backend, mais reçu comme string
  imageId?: string | null;
  signatureId?: string | null;
  cabinetId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        throw error;
      })
    );
  }


  
  getSecretairesByCabinet(cabinetId: number): Observable<UserResponse[]> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<UserResponse[]>(`${this.apiUrl}/cabinet/${cabinetId}/secretaires`, { headers });
    }

  /**
   * Récupérer tous les utilisateurs
   */
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw error;
      })
    );
  }

  /**
   * Récupérer tous les médecins (utilisateurs avec rôle MEDECIN)
   */
  getAllMedecins(): Observable<UserResponse[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => 
        user.role === 'MEDECIN' || 
        user.role === 'medecin' ||
        user.role === 'Médecin'
      ))
    );
  }

  /**
   * Récupérer les médecins d'un cabinet spécifique
   */
  getMedecinsByCabinet(cabinetId: number): Observable<UserResponse[]> {
    const url = `http://localhost:8080/users/cabinet/${cabinetId}/medecins`;
    console.log('Appel API pour récupérer les médecins:', url);
    return this.http.get<UserResponse[]>(url).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des médecins du cabinet:', error);
        console.error('URL appelée:', url);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        throw error;
      })
    );
  }
}

