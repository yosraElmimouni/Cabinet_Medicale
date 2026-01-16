import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CabinetService, Cabinet } from '../../services/cabinet';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sup-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sup-header.html',
  styleUrl: './admin-sup-header.scss',
})
export class AdminSupHeader implements OnInit  {
  adminName: string = 'Admin';
  currentCabinet: Cabinet | null = null;
  currentCabinetId: string | null = null;
  cabinets: Cabinet[] = [];
  showUserMenu: boolean = false;
  notificationCount: number = 0;
  isSuperAdmin: boolean = false;

  constructor(
    private router: Router,
    private cabinetService: CabinetService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAdminProfile();
    this.loadCabinets();
    this.checkSuperAdminStatus();
  }

  loadAdminProfile() {
    const admin = this.authService.getCurrentUser();
    if (admin) {
      this.adminName = admin.nom + ' ' + admin.prenom;
      this.currentCabinetId = admin.cabinetId ? admin.cabinetId.toString() : null;
    }
  }

  loadCabinets() {
    this.cabinetService.getAllCabinets().subscribe({
      next: (cabinets: Cabinet[]) => {
        this.cabinets = cabinets;
        this.setCurrentCabinet();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des cabinets:', error);
      }
    });
  }

  setCurrentCabinet() {
    if (this.currentCabinetId && this.cabinets.length > 0) {
      this.currentCabinet = this.cabinets.find(c => 
        c.id.toString() === this.currentCabinetId
      ) || null;
    }
  }

  checkSuperAdminStatus() {
    this.isSuperAdmin = this.authService.isSuperAdmin();
  }

  onCabinetChange(event: any) {
    const cabinetId = event.target.value;
    if (cabinetId) {
      this.cabinetService.setCurrentCabinet(Number(cabinetId)).subscribe({
        next: (cabinet: Cabinet) => {
          this.currentCabinet = cabinet;
          this.currentCabinetId = cabinetId;
          this.reloadCabinetData();
        },
        error: (error: any) => {
          console.error('Erreur lors du changement de cabinet:', error);
        }
      });
    } else {
      this.currentCabinet = null;
      this.currentCabinetId = null;
      this.reloadAllData();
    }
  }

  reloadCabinetData() {
    console.log('Rechargement des données pour le cabinet:', this.currentCabinetId);
  }

  reloadAllData() {
    console.log('Rechargement de toutes les données');
  }

  switchCabinet() {
    this.showUserMenu = false;
  }

  openNotifications() {
    this.showUserMenu = false;
    this.router.navigate(['/admin/notifications']);
  }

  goToSuperAdmin() {
    this.showUserMenu = false;
    this.router.navigate(['/super-admin']);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
