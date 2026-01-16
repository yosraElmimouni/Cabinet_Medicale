import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Cabinet {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
}

interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  cabinetId: number;
  role: string;
}

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.scss']
})
export class AdminHeader implements OnInit {
  adminName: string = 'Administrateur';
  currentCabinet: Cabinet | null = null;
  cabinets: Cabinet[] = [];
  showUserMenu: boolean = false;
  notificationCount: number = 3;
  isSuperAdmin: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadAdminProfile();
    this.loadCabinets();
  }

  loadAdminProfile() {
    // Simulation - normalement vous récupérez depuis un service d'authentification
    const adminData: AdminUser = {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'admin@cabinet.fr',
      cabinetId: 1,
      role: 'admin'
    };
    
    this.adminName = `${adminData.prenom} ${adminData.nom}`;
    this.loadCurrentCabinet(adminData.cabinetId);
  }

  loadCabinets() {
    // Simulation des cabinets
    this.cabinets = [
      {
        id: 1,
        nom: 'Cabinet Médical Central',
        adresse: '123 Avenue des Champs-Élysées',
        ville: 'Paris',
        telephone: '01 23 45 67 89',
        email: 'contact@cabinet-central.fr'
      },
      {
        id: 2,
        nom: 'Polyclinique du Nord',
        adresse: '456 Rue de la République',
        ville: 'Lille',
        telephone: '03 20 12 34 56',
        email: 'info@polyclinique-nord.fr'
      },
      {
        id: 3,
        nom: 'Centre Médical Sud',
        adresse: '789 Boulevard de la Liberté',
        ville: 'Marseille',
        telephone: '04 91 23 45 67',
        email: 'accueil@centre-sud.fr'
      },
      {
        id: 4,
        nom: 'Clinique Saint-Louis',
        adresse: '321 Rue du Faubourg Saint-Honoré',
        ville: 'Lyon',
        telephone: '04 78 12 34 56',
        email: 'contact@clinique-stlouis.fr'
      }
    ];
  }

  loadCurrentCabinet(cabinetId: number) {
    const cabinet = this.cabinets.find(c => c.id === cabinetId);
    if (cabinet) {
      this.currentCabinet = cabinet;
    } else {
      // Si le cabinet n'est pas trouvé, prendre le premier
      this.currentCabinet = this.cabinets.length > 0 ? this.cabinets[0] : null;
    }
  }

  // Méthode pour obtenir les initiales du nom
  getInitials(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  switchCabinet() {
    if (this.cabinets.length > 1) {
      // Ouvrir un modal pour changer de cabinet
      const currentIndex = this.cabinets.findIndex(c => c.id === this.currentCabinet?.id);
      const nextIndex = (currentIndex + 1) % this.cabinets.length;
      this.currentCabinet = this.cabinets[nextIndex];
      
      // Ici, vous pourriez sauvegarder le choix dans le localStorage
      localStorage.setItem('selectedCabinetId', this.currentCabinet.id.toString());
      
      // Recharger la page ou émettre un événement
      alert(`Cabinet changé pour: ${this.currentCabinet.nom}`);
    }
  }

  openNotifications() {
    this.router.navigate(['/admin/notifications']);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    // Simuler la déconnexion
    localStorage.removeItem('token');
    localStorage.removeItem('selectedCabinetId');
    this.router.navigate(['/login']);
  }
}