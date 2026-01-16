import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserResponse } from '../../services/user';
import { AuthService } from '../../services/auth';

export interface Medecin {
  idMedecin: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  dateEmbauche: Date;
  statut: 'actif' | 'inactif' | 'congé';
  avatar?: string;
  cabinetId: number;
  cabinetNom: string;
}

@Component({
  selector: 'app-admin-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-medecins.html',
  styleUrls: ['./admin-medecins.scss']
})
export class AdminMedecins implements OnInit {
  adminCabinetId: number = 0;
  adminCabinetNom: string = '';
  
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  medecins: Medecin[] = [];
  searchQuery: string = '';
  selectedCabinet: number = 0;
  selectedSpecialite: string = 'tous';
  selectedStatut: string = 'tous';
  
  showAddForm: boolean = false;
  newMedecin: any = {
    nom: '',
    prenom: '',
    specialite: '',
    email: '',
    telephone: '',
    matricule: '',
    dateEmbauche: new Date().toISOString().split('T')[0],
    statut: 'actif',
    cabinetId: 0
  };

  totalMedecins: number = 0;
  medecinsActifs: number = 0;
  medecinsEnConge: number = 0;
  medecinsInactifs: number = 0;

  specialites: string[] = [
    'Cardiologie', 'Pédiatrie', 'Dermatologie', 'Chirurgie', 
    'Gynécologie', 'Orthopédie', 'Neurologie', 'Ophtalmologie', 
    'Radiologie', 'Psychiatrie', 'Médecine générale'
  ];

  currentDate: string = new Date().toLocaleDateString();

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user.cabinetId) {
      this.adminCabinetId = user.cabinetId;
      this.adminCabinetNom = "Votre Cabinet";
      this.selectedCabinet = this.adminCabinetId;
      this.newMedecin.cabinetId = this.adminCabinetId;
      this.loadMedecins();
    }
  }

  loadMedecins() {
    if (this.adminCabinetId) {
      this.userService.getMedecinsByCabinet(this.adminCabinetId).subscribe({
        next: (users: UserResponse[]) => {
          this.medecins = users.map(u => ({
            idMedecin: u.id,
            nom: u.nom,
            prenom: u.prenom,
            specialite: 'Médecin', // On peut adapter si le backend renvoie la spécialité
            email: u.email,
            telephone: u.numTel,
            matricule: 'MED-' + u.id,
            dateEmbauche: new Date(),
            statut: 'actif',
            avatar: u.nom.substring(0, 1) + u.prenom.substring(0, 1),
            cabinetId: u.cabinetId || this.adminCabinetId,
            cabinetNom: this.adminCabinetNom
          }));
          this.calculerStatistiques();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des médecins:', err);
        }
      });
    }
  }

  calculerStatistiques() {
    this.totalMedecins = this.medecins.length;
    this.medecinsActifs = this.medecins.filter(m => m.statut === 'actif').length;
    this.medecinsEnConge = this.medecins.filter(m => m.statut === 'congé').length;
    this.medecinsInactifs = this.medecins.filter(m => m.statut === 'inactif').length;
  }

  get filteredMedecins(): Medecin[] {
    let filtered = this.medecins.filter(m => {
      const matchesSearch = !this.searchQuery || 
        m.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        m.prenom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        m.specialite.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesSpec = this.selectedSpecialite === 'tous' || m.specialite === this.selectedSpecialite;
      const matchesStatut = this.selectedStatut === 'tous' || m.statut === this.selectedStatut;
      
      return matchesSearch && matchesSpec && matchesStatut;
    });

    return filtered.sort((a, b) => {
      const valA = (a as any)[this.sortBy];
      const valB = (b as any)[this.sortBy];
      return this.sortDirection === 'asc' ? 
        (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedSpecialite = 'tous';
    this.selectedStatut = 'tous';
    this.sortBy = 'nom';
  }

  validerFormulaire(): boolean {
    return !!(this.newMedecin.nom && this.newMedecin.prenom && this.newMedecin.email);
  }

  ajouterMedecin() {
    if (this.validerFormulaire()) {
      const med: Medecin = {
        idMedecin: Math.max(...this.medecins.map(m => m.idMedecin), 0) + 1,
        ...this.newMedecin,
        avatar: this.newMedecin.nom.substring(0, 1) + this.newMedecin.prenom.substring(0, 1),
        cabinetNom: this.adminCabinetNom
      };
      this.medecins.push(med);
      this.calculerStatistiques();
      this.showAddForm = false;
      this.resetNewMedecin();
    }
  }

  resetNewMedecin() {
    this.newMedecin = {
      nom: '', prenom: '', specialite: '', email: '', 
      telephone: '', matricule: '', 
      dateEmbauche: new Date().toISOString().split('T')[0], 
      statut: 'actif', cabinetId: this.adminCabinetId
    };
  }

  editMedecin(medecin: Medecin) {
    alert('Modification de ' + medecin.nom);
  }

  supprimerMedecin(id: number) {
    if (confirm('Supprimer ce médecin ?')) {
      this.medecins = this.medecins.filter(m => m.idMedecin !== id);
      this.calculerStatistiques();
    }
  }

  toggleStatut(medecin: Medecin) {
    const statuts: ('actif' | 'inactif' | 'congé')[] = ['actif', 'inactif', 'congé'];
    const currentIndex = statuts.indexOf(medecin.statut);
    medecin.statut = statuts[(currentIndex + 1) % statuts.length];
    this.calculerStatistiques();
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'actif': return '#10B981';
      case 'inactif': return '#EF4444';
      case 'congé': return '#F59E0B';
      default: return '#6B7280';
    }
  }

  getStatutBackgroundColor(statut: string): string {
    return this.getStatutColor(statut) + '20';
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  getMedecinsCountBySpecialite(spec: string): number {
    return this.medecins.filter(m => m.specialite === spec).length;
  }

  exportToExcel() {
    alert('Exportation Excel...');
  }

  printList() {
    window.print();
  }
}
