import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UserService, UserResponse } from '../../services/user';

interface Secretaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateEmbauche: Date;
  status: 'actif' | 'inactif' | 'congé';
  cabinetId: number;
  cabinet: string;
  rendezVousAssignes: number;
  heuresTravail: number;
  performance: number;
  specialite: string;
  avatarColor: string;
}

@Component({
  selector: 'app-admin-secritaires',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-secritaires.html',
  styleUrls: ['./admin-secritaires.scss']
})
export class AdminSecritaires implements OnInit {
  adminCabinetId: number = 0;
  adminCabinetNom: string = 'Votre Cabinet';
  
  secretaires: Secretaire[] = [];
  
  showAddForm: boolean = false;
  newSecretaire: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateEmbauche: new Date().toISOString().split('T')[0],
    status: 'actif',
    cabinetId: 0,
    cabinet: '',
    rendezVousAssignes: 0,
    heuresTravail: 35,
    performance: 85,
    specialite: '',
    avatarColor: '#3B82F6'
  };

  stats = {
    total: 0,
    actifs: 0,
    performanceMoyenne: 0,
    totalRendezVous: 0
  };

  searchTerm: string = '';
  statusFilter: string = 'all';
  specialiteFilter: string = 'all';
  sortColumn: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  specialites: string[] = ['Accueil', 'Facturation', 'Gestion RDV', 'Archives'];
  specialiteRepartition: any[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user.cabinetId) {
      this.adminCabinetId = user.cabinetId;
      this.newSecretaire.cabinetId = this.adminCabinetId;
      this.loadSecretaires();
    }
  }

  loadSecretaires() {
    if (this.adminCabinetId) {
      this.userService.getSecretairesByCabinet(this.adminCabinetId).subscribe({
        next: (users: UserResponse[]) => {
          this.secretaires = users.map(u => ({
            id: u.id,
            nom: u.nom,
            prenom: u.prenom,
            email: u.email,
            telephone: u.numTel,
            dateEmbauche: new Date(),
            status: 'actif',
            cabinetId: u.cabinetId || this.adminCabinetId,
            cabinet: this.adminCabinetNom,
            rendezVousAssignes: 0,
            heuresTravail: 35,
            performance: 85,
            specialite: 'Accueil',
            avatarColor: '#3B82F6'
          }));
          this.calculerStatistiques();
          this.calculerRepartitionSpecialites();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des secrétaires:', err);
        }
      });
    }
  }

  calculerStatistiques() {
    this.stats.total = this.secretaires.length;
    this.stats.actifs = this.secretaires.filter(s => s.status === 'actif').length;
    const totalPerf = this.secretaires.reduce((acc, s) => acc + s.performance, 0);
    this.stats.performanceMoyenne = this.stats.total > 0 ? Math.round(totalPerf / this.stats.total) : 0;
    this.stats.totalRendezVous = this.secretaires.reduce((acc, s) => acc + s.rendezVousAssignes, 0);
  }

  calculerRepartitionSpecialites() {
    this.specialiteRepartition = this.specialites.map(spec => {
      const count = this.secretaires.filter(s => s.specialite === spec).length;
      return {
        nom: spec,
        count: count,
        percentage: this.stats.total > 0 ? (count / this.stats.total) * 100 : 0
      };
    });
  }

  get filteredSecretaires(): Secretaire[] {
    let filtered = this.secretaires.filter(s => {
      const matchesSearch = !this.searchTerm || 
        s.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.prenom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || s.status === this.statusFilter;
      const matchesSpec = this.specialiteFilter === 'all' || s.specialite === this.specialiteFilter;
      return matchesSearch && matchesStatus && matchesSpec;
    });

    return filtered.sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];
      return this.sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }

  get paginatedSecretaires(): Secretaire[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSecretaires.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSecretaires.length / this.itemsPerPage) || 1;
  }

  ajouterSecretaire() {
    if (this.validerFormulaire()) {
      const sec: Secretaire = {
        id: Date.now(),
        ...this.newSecretaire,
        cabinet: this.adminCabinetNom
      };
      this.secretaires.push(sec);
      this.calculerStatistiques();
      this.calculerRepartitionSpecialites();
      this.showAddForm = false;
      this.resetForm();
    }
  }

  validerFormulaire(): boolean {
    return !!(this.newSecretaire.nom && this.newSecretaire.prenom && this.newSecretaire.email);
  }

  resetForm() {
    this.newSecretaire = {
      nom: '', prenom: '', email: '', telephone: '',
      dateEmbauche: new Date().toISOString().split('T')[0],
      status: 'actif', cabinetId: this.adminCabinetId,
      rendezVousAssignes: 0, heuresTravail: 35, performance: 85,
      specialite: '', avatarColor: '#3B82F6'
    };
  }

  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.specialiteFilter = 'all';
    this.currentPage = 1;
  }

  genererRapport() {
    alert('Génération du rapport en cours...');
  }

  editSecretaire(s: Secretaire) {
    alert('Modification de ' + s.nom);
  }

  deleteSecretaire(s: Secretaire) {
    if (confirm('Supprimer cette secrétaire ?')) {
      this.secretaires = this.secretaires.filter(sec => sec.id !== s.id);
      this.calculerStatistiques();
      this.calculerRepartitionSpecialites();
    }
  }

  toggleStatus(s: Secretaire) {
    s.status = s.status === 'actif' ? 'inactif' : 'actif';
    this.calculerStatistiques();
  }

  sort(col: string) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  getInitiales(nom: string, prenom: string): string {
    return (prenom[0] || '') + (nom[0] || '');
  }

  getDateFormatee(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  getAnciennete(date: any): number {
    const embauche = new Date(date);
    const diff = Date.now() - embauche.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  }

  getMin(page: number, size: number, list: any[]): number {
    return Math.min(page * size, list.length);
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }
}
