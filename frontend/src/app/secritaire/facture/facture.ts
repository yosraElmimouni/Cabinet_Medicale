import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FactureService, FacturePatientResponse } from './facture.service';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-facture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facture.html',
  styleUrl: './facture.scss',
})
export class FactureComponent implements OnInit {
  currentDate: Date = new Date();
  searchTerm: string = '';
  viewMode: 'list' | 'grid' = 'list';
  showAddForm: boolean = false;
  isEditing: boolean = false;
  
  // Filtres
  filterStatut: string = '';
  filterDateDebut: string = '';
  filterDateFin: string = '';
  filterMontantMin: number = 0;
  filterMontantMax: number = 10000;

  // Liste des factures réelles
  factures: FacturePatientResponse[] = [];
  filteredFactures: FacturePatientResponse[] = [];

  // Statistiques
  stats = {
    chiffreAffaireTotal: 0,
    evolutionCA: 12,
    facturesEnAttente: 0,
    montantEnAttente: 0,
    facturesPayees: 0,
    tauxPaiement: 0,
    montantMoyen: 0
  };

  constructor(
    private factureService: FactureService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
    
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }
  

  loadFactures() {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.factureService.getFacturesBySecretaire(user.id).subscribe({
        next: (data) => {
          this.factures = data;
          this.filteredFactures = [...this.factures];
          this.updateStats();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des factures:', err);
        }
      });
    }
  }

  updateStats() {
    if (this.factures.length === 0) return;

    const total = this.factures.reduce((sum, f) => sum + f.montantTotal, 0);
    this.stats.chiffreAffaireTotal = total;
    this.stats.montantMoyen = Math.round(total / this.factures.length);
    this.stats.facturesPayees = this.factures.length; 
    this.stats.tauxPaiement = 100;
    this.stats.facturesEnAttente = 0;
    this.stats.montantEnAttente = 0;
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.factures];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.patient.nom.toLowerCase().includes(term) || 
        f.patient.prenom.toLowerCase().includes(term) ||
        f.idFacture.toString().includes(term)
      );
    }

    if (this.filterDateDebut) {
      filtered = filtered.filter(f => f.consultation.dateConsultation >= this.filterDateDebut);
    }

    if (this.filterDateFin) {
      filtered = filtered.filter(f => f.consultation.dateConsultation <= this.filterDateFin);
    }

    if (this.filterMontantMin) {
      filtered = filtered.filter(f => f.montantTotal >= this.filterMontantMin);
    }

    if (this.filterMontantMax) {
      filtered = filtered.filter(f => f.montantTotal <= this.filterMontantMax);
    }

    this.filteredFactures = filtered;
  }

  // Méthodes d'aide pour le template original
  getPatientName(facture: FacturePatientResponse): string {
    return `${facture.patient.prenom} ${facture.patient.nom}`;
  }

  getPatientCIN(facture: FacturePatientResponse): string {
    return facture.patient.cin;
  }

  getPatientInitials(facture: FacturePatientResponse): string {
    return `${facture.patient.prenom.charAt(0)}${facture.patient.nom.charAt(0)}`;
  }

  getStatutText(statut: string): string {
    return 'Payée'; // Par défaut pour les factures existantes
  }

  getModePaiementText(mode: string): string {
    return mode || 'Non spécifié';
  }

  isEnRetard(facture: any): boolean {
    return false;
  }

  truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  // Actions (Stubs pour éviter les erreurs dans le template)
  resetForm() { this.showAddForm = false; }
  exporterFactures() { console.log('Exporting...'); }
  voirDetails(f: any) { console.log('Details', f); }
  modifierFacture(f: any) { console.log('Edit', f); }
  imprimerFacture(f: any) { console.log('Print', f); }
  envoyerFacture(f: any) { console.log('Send', f); }
  enregistrerPaiement(f: any) { console.log('Payment', f); }
  supprimerFacture(f: any) { console.log('Delete', f); }
  onSubmit() { console.log('Submit'); }
}
