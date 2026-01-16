import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth'; // Ajustez le chemin selon votre structure
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-med',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-med.html',
  styleUrls: ['./header-med.scss']
})
export class HeaderMed implements OnInit, OnDestroy {
  showUserMenu = false;
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;
  
  notificationCount = 3;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur connecté
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get displayName(): string {
    if (this.currentUser) {
      const prefix = this.currentUser.role.toUpperCase() === 'MEDECIN' ? 'Dr. ' : '';
      return `${prefix}${this.currentUser.prenom} ${this.currentUser.nom}`;
    }
    return 'Utilisateur';
  }

  get displayRole(): string {
    if (this.currentUser) {
      // Capitaliser la première lettre du rôle
      return this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1).toLowerCase();
    }
    return 'Invité';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
