// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  cabinetId?: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  imageId?: string;
  signatureId?: string;
  user?: {
    login: string;
    numTel: string;
  };
}

export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  numTel: string;
  role: string;
  cabinetId?: number;
  imageId?: string;
  signatureId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Si vous utilisez le proxy Angular, utilisez '/auth'. Sinon gardez l'URL complète.
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // Connexion
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Tentative de connexion avec:', credentials);
    console.log('URL cible:', `${this.apiUrl}/login`);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { headers })
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Réponse du serveur reçue:', response);
          this.handleLoginSuccess(response);
        }),
        catchError((error: any) => {
          console.error('Erreur détaillée du serveur:', error);
          // Si l'erreur est 0, c'est probablement un problème de CORS ou le serveur est éteint
          if (error.status === 0) {
            console.error('ERREUR DE CONNEXION : Le serveur ne répond pas ou bloque la requête (CORS).');
          }
          return throwError(() => error);
        })
      );
  }

  private handleLoginSuccess(response: AuthResponse): void {
  // Créer un objet user normalisé
  const user: User = {
    id: response.userId,
    login: response.user?.login || '',
    nom: response.nom,
    prenom: response.prenom,
    email: response.email,
    numTel: response.user?.numTel || '',
    role: response.role,
    cabinetId: response.cabinetId,
    imageId: response.imageId,
    signatureId: response.signatureId
  };

  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  // Stocker le rôle en minuscules pour cohérence
  localStorage.setItem('userRole', response.role.toLowerCase());
  localStorage.setItem('userData', JSON.stringify(user));
  this.currentUserSubject.next(user);
  
  console.log('Redirection basée sur le rôle:', response.role);
  this.redirectBasedOnRole(response.role);
}

private redirectBasedOnRole(role: string): void {
  // Normaliser le rôle en majuscules pour la comparaison
  const roleUpper = role.toUpperCase();
  
  console.log('Rôle normalisé pour redirection:', roleUpper);
  
  switch(roleUpper) {
    case 'SECRETAIRE':
      console.log('Redirection vers secrétaire dashboard');
      this.router.navigate(['/secritaire/secretary-dashboard']);
      break;
    case 'MEDECIN':
      console.log('Redirection vers médecin dashboard');
      this.router.navigate(['/medecin/dashboard']);
      break;
    case 'SUPER_ADMIN':
      console.log('Redirection vers admin dashboard (SUPER_ADMIN)');
      this.router.navigate(['/AdminSup/cabinet']);
      break;

    case 'ADMIN_CABINET':
      console.log('Redirection vers admin dashboard (ADMIN_CABINET)');
      this.router.navigate(['/Admin/dashboard']);
      break;
    default:
      console.warn('Rôle non reconnu, redirection vers home:', role);
      this.router.navigate(['/']);
  }
}
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
      return !!this.currentUserValue;
  }
  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      const userData = this.getUserData();
      return userData?.role === 'SUPER_ADMIN' || userData?.role === 'super_admin';
    }
    return user.role === 'SUPER_ADMIN' || user.role === 'super_admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const tokenData = this.parseJwt(token);
    if (!tokenData || !tokenData.exp) return false;
    return Date.now() < tokenData.exp * 1000;
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  private loadUserFromStorage(): void {
    const userData = this.getUserData();
    if (userData) {
      this.currentUserSubject.next(userData);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserData(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  isSecretary(): boolean {
    const role = this.getUserRole();
    return role === 'secretaire';
  }

  isDoctor(): boolean {
    const role = this.getUserRole();
    return role === 'medecin';
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'super_admin' || role === 'admin_cabinet';
  }

  hasCabinet(): boolean {
    const user = this.getCurrentUser();
    return !!user?.cabinetId;
  }

  updateUserData(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        tap(user => {
          this.updateUserData(user);
        }),
        catchError(error => {
          console.error('Error refreshing user data:', error);
          return throwError(() => error);
        })
      );
  }
  setSession(authResult: any) {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('currentUser', JSON.stringify(authResult));
  }
}