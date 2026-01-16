import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-sec',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-sec.html',
  styleUrls: ['./header-sec.scss']
})
export class HeaderSec implements OnInit, OnDestroy {
  showUserMenu = false;
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;
  
  notificationCount = 3;

  // Déclaration explicite des propriétés pour le template
  displayName: string = 'Utilisateur';
  displayRole: string = 'Invité';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur connecté
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateDisplayInfo();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateDisplayInfo(): void {
    if (this.currentUser) {
      const prefix = this.currentUser.role.toUpperCase() === 'MEDECIN' ? 'Dr. ' : '';
      this.displayName = `${prefix}${this.currentUser.prenom} ${this.currentUser.nom}`;
      
      // Capitaliser la première lettre du rôle
      const role = this.currentUser.role;
      this.displayRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    } else {
      this.displayName = 'Utilisateur';
      this.displayRole = 'Invité';
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
