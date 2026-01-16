import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CabinetService, Cabinet } from '../../services/cabinet';
import { AuthService, User } from '../../services/auth';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend: number;
  trendLabel: string;
  description: string;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'cabinet' | 'appointment' | 'payment';
  title: string;
  description: string;
  time: string;
  user: string;
  status: string;
}

interface CabinetFormData {
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  logo?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit, OnDestroy {
  adminName: string = 'Administrateur';
  currentDate: string = '';
  currentTime: string = '';
  private timeInterval: any;
  
  // États du composant
  showCabinetForm: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  
  // Cabinet unique
  cabinet: Cabinet | null = null;
  
  // Formulaire de cabinet
  editCabinetData: CabinetFormData = {
    nomCabinet: '',
    adresseCabinet: '',
    emailCabinet: '',
    teleCabinet: '',
    logo: ''
  };
  
  // Statistiques
  stats: StatCard[] = [];
  
  // Activités récentes
  recentActivities: RecentActivity[] = [];
  
  // Pour utiliser Math dans le template
  Math = Math;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cabinetService: CabinetService
  ) {}

  ngOnInit() {
    this.loadAdminProfile();
    this.initDateTime();
    this.loadDashboardData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  // Méthode utilitaire pour convertir hex en RGB
  hexToRgb(hex: string): string {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  loadAdminProfile() {
    const admin = this.authService.getCurrentUser();
    if (admin) {
      this.adminName = `${admin.prenom} ${admin.nom}`;
    }
  }

  initDateTime() {
    this.updateDateTime();
    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 60000);
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.currentTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async loadDashboardData() {
    await this.loadCabinet();
    this.loadStats();
    this.loadRecentActivities();
  }

  async loadCabinet() {
    try {
      // Utiliser getAllCabinets() pour récupérer tous les cabinets
      const cabinets = await this.cabinetService.getAllCabinets().toPromise();
      if (cabinets && cabinets.length > 0) {
        // Prendre le premier cabinet
        this.cabinet = cabinets[0];
        if (this.cabinet) {
          this.editCabinetData = {
            nomCabinet: this.cabinet.nomCabinet,
            adresseCabinet: this.cabinet.adresseCabinet,
            emailCabinet: this.cabinet.emailCabinet,
            teleCabinet: this.cabinet.teleCabinet,
            logo: this.cabinet.logo || ''
          };
        }
      } else {
        // Si aucun cabinet, charger des données mockées
        this.loadMockCabinet();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cabinet:', error);
      this.loadMockCabinet();
    }
  }

  loadMockCabinet() {
    // Données mockées pour le développement
    this.cabinet = {
      id: 1,
      logo: 'https://via.placeholder.com/150',
      nomCabinet: 'Clinique Santé Plus',
      adresseCabinet: '123 Rue de la Santé, Paris 75001',
      emailCabinet: 'contact@cliniquesanteparis.fr',
      teleCabinet: '01 23 45 67 89',
      statut: 'ACTIF'
    };
    
    if (this.cabinet) {
      this.editCabinetData = {
        nomCabinet: this.cabinet.nomCabinet,
        adresseCabinet: this.cabinet.adresseCabinet,
        emailCabinet: this.cabinet.emailCabinet,
        teleCabinet: this.cabinet.teleCabinet,
        logo: this.cabinet.logo || ''
      };
    }
  }

  loadStats() {
    this.stats = [
      {
        title: 'Médecins',
        value: 6,
        icon: 'fas fa-user-md',
        color: '#0ea5e9',
        trend: 2,
        trendLabel: 'ce mois',
        description: 'Médecins actifs'
      },
      {
        title: 'Secrétaires',
        value: 3,
        icon: 'fas fa-user-nurse',
        color: '#10B981',
        trend: 1,
        trendLabel: 'nouveaux',
        description: 'Secrétaires actives'
      },
      {
        title: 'Patients',
        value: 850,
        icon: 'fas fa-user-injured',
        color: '#8B5CF6',
        trend: 12,
        trendLabel: 'ce mois',
        description: 'Patients total'
      },
      {
        title: 'Revenus',
        value: 45000,
        icon: 'fas fa-euro-sign',
        color: '#F59E0B',
        trend: 15,
        trendLabel: 'vs mois dernier',
        description: 'Revenus mensuels'
      },
      {
        title: 'Rendez-vous',
        value: 328,
        icon: 'fas fa-calendar-check',
        color: '#EC4899',
        trend: 8,
        trendLabel: 'ce mois',
        description: 'Rendez-vous programmés'
      },
      {
        title: 'Taux de remplissage',
        value: 85,
        icon: 'fas fa-chart-pie',
        color: '#06B6D4',
        trend: 5,
        trendLabel: 'vs semaine dernière',
        description: 'Occupation du cabinet'
      }
    ];
  }

  loadRecentActivities() {
    this.recentActivities = [
      {
        id: 1,
        type: 'appointment',
        title: 'Nouveau rendez-vous',
        description: 'Consultation avec M. Dupont',
        time: 'Il y a 30 minutes',
        user: 'Dr. Martin',
        status: 'completed'
      },
      {
        id: 2,
        type: 'user',
        title: 'Nouveau médecin ajouté',
        description: 'Dr. Sophie Lambert a rejoint le cabinet',
        time: 'Il y a 2 heures',
        user: 'Administrateur',
        status: 'completed'
      },
      {
        id: 3,
        type: 'payment',
        title: 'Paiement reçu',
        description: 'Facture #INV-2024-015 payée',
        time: 'Il y a 4 heures',
        user: 'Mme. Dubois',
        status: 'completed'
      },
      {
        id: 4,
        type: 'appointment',
        title: 'Rendez-vous annulé',
        description: 'Consultation urgente annulée',
        time: 'Il y a 1 jour',
        user: 'M. Bernard',
        status: 'cancelled'
      }
    ];
  }

  setupRealTimeUpdates() {
    setInterval(() => {
      this.updateRandomStats();
    }, 30000);
  }

  updateRandomStats() {
    const randomIndex = Math.floor(Math.random() * this.stats.length);
    const change = Math.floor(Math.random() * 10) - 3;
    this.stats[randomIndex].value += change;
    
    if (change > 0) {
      this.stats[randomIndex].trend = Math.abs(change);
    } else {
      this.stats[randomIndex].trend = -Math.abs(change);
    }
  }

  // Navigation
  goToMedecins() {
    this.router.navigate(['/admin/medecins']);
  }

  goToSecretaires() {
    this.router.navigate(['/admin/secretaires']);
  }

  goToPatients() {
    this.router.navigate(['/admin/patients']);
  }

  goToAppointments() {
    this.router.navigate(['/admin/rendez-vous']);
  }

  goToReports() {
    this.router.navigate(['/admin/reports']);
  }

  // Édition du cabinet
  editCabinet() {
    this.showCabinetForm = true;
  }

  async updateCabinet() {
    if (!this.validateCabinetForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      if (!this.cabinet) {
        throw new Error('Aucun cabinet à mettre à jour');
      }

      // Créer un FormData pour l'envoi
      const formData = new FormData();
      formData.append('nomCabinet', this.editCabinetData.nomCabinet);
      formData.append('adresseCabinet', this.editCabinetData.adresseCabinet);
      formData.append('emailCabinet', this.editCabinetData.emailCabinet);
      formData.append('teleCabinet', this.editCabinetData.teleCabinet);
      
      if (this.editCabinetData.logo && typeof this.editCabinetData.logo === 'string') {
        // Si c'est une URL string, on ne l'envoie pas dans FormData
        // ou on pourrait la convertir en fichier si nécessaire
      }

      // Simuler mise à jour API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le cabinet local
      if (this.cabinet) {
        this.cabinet = {
          ...this.cabinet,
          nomCabinet: this.editCabinetData.nomCabinet,
          adresseCabinet: this.editCabinetData.adresseCabinet,
          emailCabinet: this.editCabinetData.emailCabinet,
          teleCabinet: this.editCabinetData.teleCabinet,
          logo: this.editCabinetData.logo || this.cabinet.logo
        };
      }
      
      // Ajouter une activité
      const newActivity: RecentActivity = {
        id: this.recentActivities.length + 1,
        type: 'cabinet',
        title: 'Cabinet mis à jour',
        description: 'Les informations du cabinet ont été modifiées',
        time: 'À l\'instant',
        user: this.adminName,
        status: 'completed'
      };
      this.recentActivities.unshift(newActivity);
      
      this.showCabinetForm = false;
      
    } catch (error) {
      this.errorMessage = 'Erreur lors de la mise à jour du cabinet';
      console.error('Erreur:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  validateCabinetForm(): boolean {
    this.errorMessage = '';
    
    if (!this.editCabinetData.nomCabinet.trim()) {
      this.errorMessage = 'Le nom du cabinet est requis';
      return false;
    }

    if (!this.editCabinetData.adresseCabinet.trim()) {
      this.errorMessage = 'L\'adresse du cabinet est requise';
      return false;
    }

    if (!this.editCabinetData.emailCabinet.trim()) {
      this.errorMessage = 'L\'email du cabinet est requis';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editCabinetData.emailCabinet)) {
      this.errorMessage = 'Veuillez entrer un email valide';
      return false;
    }

    if (!this.editCabinetData.teleCabinet.trim()) {
      this.errorMessage = 'Le téléphone du cabinet est requis';
      return false;
    }

    return true;
  }

  toggleCabinetForm() {
    this.showCabinetForm = !this.showCabinetForm;
    if (!this.showCabinetForm) {
      this.errorMessage = '';
    }
  }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editCabinetData.logo = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.editCabinetData.logo = '';
    if (this.cabinet) {
      this.cabinet.logo = undefined;
    }
  }

  // Actions rapides
  generateReport() {
    this.router.navigate(['/admin/reports/generate']);
  }

  viewAllActivities() {
    this.router.navigate(['/admin/activities']);
  }

  // Utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'user': return 'fas fa-user-plus';
      case 'cabinet': return 'fas fa-clinic-medical';
      case 'appointment': return 'fas fa-calendar-check';
      case 'payment': return 'fas fa-euro-sign';
      default: return 'fas fa-bell';
    }
  }

  getActivityColor(type: string): string {
    switch(type) {
      case 'user': return '#10B981';
      case 'cabinet': return '#0ea5e9';
      case 'appointment': return '#EC4899';
      case 'payment': return '#F59E0B';
      default: return '#6B7280';
    }
  }
}