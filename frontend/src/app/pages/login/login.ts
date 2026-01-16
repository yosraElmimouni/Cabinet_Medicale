import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  // Données du formulaire - changé pour correspondre à l'API
  loginData = {
    email: '',      // Utilisé comme "login" dans l'API
    password: '',
    rememberMe: false
  };

  // États
  showPassword = false;
  isLoading = false;
  showForgotPasswordModal = false;
  forgotPasswordEmail = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Basculer la visibilité du mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Soumission du formulaire
  onLogin() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    // Créer l'objet de requête avec le bon format
    const credentials: LoginRequest = {
      login: this.loginData.email,  // Votre champ email est utilisé comme login
      password: this.loginData.password
    };

    console.log('Envoi des credentials:', credentials);

    // Appel au service d'authentification
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        
        // Stocker "Se souvenir de moi" si coché
        if (this.loginData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // La redirection est gérée automatiquement dans handleLoginSuccess
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.isLoading = false;
        
        // Gérer les différents types d'erreurs
        if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.';
        } else if (error.status === 401) {
          this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé. Votre compte est peut-être désactivé.';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la connexion.';
        }
      }
    });
  }

  // Mot de passe oublié
  onForgotPassword(event: Event) {
    event.preventDefault();
    this.showForgotPasswordModal = true;
  }

  // Fermer le modal
  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordEmail = '';
  }

  // Envoyer le lien de réinitialisation
  sendPasswordReset() {
    if (!this.forgotPasswordEmail) return;

    console.log('Envoi du lien de réinitialisation à:', this.forgotPasswordEmail);
    
    // TODO: Implémenter l'appel API pour la réinitialisation
    this.isLoading = true;
    
    setTimeout(() => {
      alert('Un lien de réinitialisation a été envoyé à votre adresse email.');
      this.closeForgotPasswordModal();
      this.isLoading = false;
    }, 1500);
  }

  // Connexion avec Google
  loginWithGoogle() {
    this.isLoading = true;
    console.log('Connexion avec Google...');
    
    // TODO: Implémenter l'OAuth Google
    alert('La connexion Google n\'est pas encore implémentée.');
    this.isLoading = false;
  }

  // Connexion avec Apple
  loginWithApple() {
    this.isLoading = true;
    console.log('Connexion avec Apple...');
    
    // TODO: Implémenter l'OAuth Apple
    alert('La connexion Apple n\'est pas encore implémentée.');
    this.isLoading = false;
  }

  // Redirection vers la page d'inscription
  onRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  // Vérifier si le formulaire est valide
  isFormValid(): boolean {
    return this.loginData.email.length > 0 && this.loginData.password.length >= 6;
  }
}