import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConsultationService } from '../../services/consultation';
import { RendezVousService as RendezVousService } from '../../services/rendez-vous';
import { ConsultationResponse, ConsultationRequest, Consultation } from '../../models/consultation.model';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.html',
  styleUrls: ['./consultation.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [DatePipe]
})
export class ConsultationComponent implements OnInit, OnDestroy {
  // Données
  consultations: ConsultationResponse[] = [];
  filteredConsultations: ConsultationResponse[] = [];
  patients: any[] = [];
  rendezVousDisponibles: any[] = [];
  
  // Filtres
  searchTerm: string = '';
  selectedType: string = 'all';
  selectedStatus: string = 'all';
  selectedPatient: number = 0;
  startDate: string = '';
  endDate: string = '';
  consultationTypes: string[] = ['Générale', 'Spécialisée', 'Urgence', 'Suivi', 'Contrôle'];
  
  // Modales
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showRendezVousModal: boolean = false;
  showDetailsModal: boolean = false;
  
  // Objets temporaires
  newConsultation: ConsultationRequest = this.createEmptyConsultation();
  currentConsultation: ConsultationResponse | null = null;
  consultationDetails: ConsultationResponse | null = null;
  selectedRendezVous: any = { RendezVousId: 0, isTerminate: false };
  
  // États
  isLoading: boolean = false;
  isDeleting: boolean = false;
  
  // Statistiques
  stats = {
    total: 0,
    today: 0,
    completed: 0,
    pending: 0
  };
  
  // Formulaires
  consultationForm: FormGroup;
  
  // Date courante
  currentDate: Date = new Date();
  private dateInterval: any;
  
  constructor(
    private consultationService: ConsultationService,
    private rendezVousService: RendezVousService,
    private authService: AuthService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.consultationForm = this.fb.group({
      type: ['', Validators.required],
      dateConsultation: ['', Validators.required],
      examenClinique: [''],
      examenSupplementaire: [''],
      diagnostic: ['', Validators.required],
      traitement: [''],
      observations: [''],
      idMedecin: [null, Validators.required],
      idRendezVous: [null]
    });
  }
  
  ngOnInit(): void {
    this.loadAllData();
    this.startDateUpdate();
  }
  
  ngOnDestroy(): void {
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
  }
  
  // Chargement des données
  loadAllData(): void {
    this.isLoading = true;
    
    Promise.all([
      this.loadConsultations(),
      this.loadPatients(),
      this.loadRendezVousDisponibles(),
      this.calculateStats()
    ]).finally(() => {
      this.isLoading = false;
    });
  }
  
  loadConsultations(): Promise<void> {
    return new Promise((resolve) => {
      const userData = this.authService.getUserData();
      const idMedecin = userData?.id;
      
      if (idMedecin) {
        this.consultationService.getConsultationsByMedecin(idMedecin).subscribe({
          next: (data) => {
            // Mapper Consultation vers ConsultationResponse pour l'affichage
            this.consultations = data.map(c => ({
              idConsultation: c.idConsultation,
              type: c.type,
              dateConsultation: c.dateConsultation.toISOString(),
              examenClinique: c.examenClinique,
              examenSupplementaire: c.examenSupplementaire,
              diagnostic: c.diagnostic,
              traitement: c.traitement,
              observations: c.observations,
              idDossierMedical: c.idDossierMedical,
              facture: c.facture,
              idMedecin: c.idMedecin,
              nomMedecin: c.nomMedecin,
              idRendezVous: c.idRendezVous
            } as ConsultationResponse));
            this.filteredConsultations = [...this.consultations];
            this.calculateStats();
            resolve();
          },
          error: (err) => {
            console.error('Erreur chargement consultations:', err);
            resolve();
          }
        });
      } else {
        this.consultations = [];
        this.filteredConsultations = [];
        resolve();
      }
    });
  }
  
  loadPatients(): Promise<void> {
    return new Promise((resolve) => {
      this.patients = [];
      resolve();
    });
  }
  
  loadRendezVousDisponibles(): Promise<void> {
    return new Promise((resolve) => {
      const userData = this.authService.getUserData();
      const idMedecin = userData?.id;

      if (!idMedecin) {
        this.rendezVousDisponibles = [];
        resolve();
        return;
      }

      this.rendezVousService.getRendezVousMedecinPatient(idMedecin).subscribe({
        next: (data) => {
          const rendezVousTermines: any[] = [];
          data.forEach(item => {
            const rdvsTermines = item.rendezVousResponse.filter(rdv => rdv.statut === 'TERMINE');
            rdvsTermines.forEach(rdv => {
              rendezVousTermines.push({
                ...rdv,
                patient: item.patient,
                patientName: `${item.patient.prenom} ${item.patient.nom}`
              });
            });
          });
          this.rendezVousDisponibles = rendezVousTermines;
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement rendez-vous:', error);
          this.rendezVousDisponibles = [];
          resolve();
        }
      });
    });
  }
  
  calculateStats(): void {
    const today = new Date().toISOString().split('T')[0];
    this.stats.total = this.consultations.length;
    this.stats.today = this.consultations.filter(c => 
      c.dateConsultation.startsWith(today)
    ).length;
    this.stats.completed = this.consultations.filter(c => 
      c.facture !== null && c.diagnostic && c.traitement
    ).length;
    this.stats.pending = this.consultations.filter(c => 
      !c.diagnostic || !c.traitement
    ).length;
  }
  
  applyFilters(): void {
    let filtered = [...this.consultations];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(consultation => 
        this.getPatientName(consultation).toLowerCase().includes(term) ||
        consultation.type.toLowerCase().includes(term) ||
        consultation.diagnostic?.toLowerCase().includes(term)
      );
    }
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === this.selectedType);
    }
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(c => 
        this.getConsultationStatus(c) === (this.selectedStatus === 'completed' ? 'Complétée' : 'En cours')
      );
    }
    this.filteredConsultations = filtered;
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.selectedPatient = 0;
    this.startDate = '';
    this.endDate = '';
    this.filteredConsultations = [...this.consultations];
  }
  
  openAddModal(): void {
    const userData = this.authService.getUserData();
    this.newConsultation = this.createEmptyConsultation();
    this.newConsultation.idMedecin = userData?.id || 0;
    this.showAddModal = true;
  }
  
  addConsultation(): void {
    if (this.isLoading) return;
    
    // Validation
    if (!this.newConsultation.diagnostic || !this.newConsultation.type || !this.newConsultation.dateConsultation) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!this.newConsultation.idRendezVous) {
      alert('L\'ID du rendez-vous est obligatoire pour créer une consultation');
      return;
    }
    
    this.isLoading = true;
    
    // Appel au service pour créer la consultation via l'API
    this.consultationService.createConsultation(this.newConsultation).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAddModal = false;
        alert('Consultation créée avec succès !');
        this.loadConsultations(); // Recharger la liste
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors de la création:', err);
        alert('Erreur lors de la création de la consultation. Vérifiez que le rendez-vous est bien terminé.');
      }
    });
  }
  
  openEditModal(consultation: ConsultationResponse): void {
    this.currentConsultation = { ...consultation };
    this.showEditModal = true;
  }
  
  updateConsultation(): void {
    if (!this.currentConsultation || this.isLoading) return;
    this.isLoading = true;
    
    const request = this.consultationService.createConsultationRequest({
      ...this.currentConsultation,
      dateConsultation: new Date(this.currentConsultation.dateConsultation)
    } as any);

    this.consultationService.updateConsultation(this.currentConsultation.idConsultation, request).subscribe({
      next: () => {
        this.isLoading = false;
        this.showEditModal = false;
        alert('Consultation mise à jour avec succès !');
        this.loadConsultations();
      },
      error: (err) => {
        this.isLoading = false;
        alert('Erreur lors de la mise à jour.');
      }
    });
  }
  
  deleteConsultation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      this.isDeleting = true;
      this.consultationService.deleteConsultation(id).subscribe({
        next: () => {
          this.isDeleting = false;
          alert('Consultation supprimée avec succès !');
          this.loadConsultations();
        },
        error: (err) => {
          this.isDeleting = false;
          alert('Erreur lors de la suppression.');
        }
      });
    }
  }
  
  openRendezVousModal(): void {
    this.loadRendezVousDisponibles();
    this.selectedRendezVous = { RendezVousId: 0, isTerminate: false };
    this.showRendezVousModal = true;
  }
  
  createFromRendezVous(): void {
    if (!this.selectedRendezVous.RendezVousId || this.isLoading) {
      alert('Veuillez sélectionner un rendez-vous');
      return;
    }
    
    const selectedRdv = this.rendezVousDisponibles.find(
      rdv => rdv.idRendezVous === this.selectedRendezVous.RendezVousId
    );
    
    if (!selectedRdv) return;
    
    const userData = this.authService.getUserData();
    
    this.newConsultation = {
      type: selectedRdv.type || 'Générale',
      dateConsultation: selectedRdv.dateRdvs || new Date().toISOString(),
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: selectedRdv.remarque || '',
      idDossierMedical: 0, // Sera géré par le backend
      idMedecin: userData?.id || selectedRdv.idMedecin,
      idRendezVous: selectedRdv.idRendezVous
    };
    
    this.showRendezVousModal = false;
    this.showAddModal = true;
  }
  
  openDetailsModal(consultation: ConsultationResponse): void {
    this.consultationDetails = { ...consultation };
    this.showDetailsModal = true;
  }

  getPatientName(consultation: ConsultationResponse): string {
    if (consultation.nomMedecin) return consultation.nomMedecin;
    return 'Patient #' + (consultation.idDossierMedical || 'Inconnu');
  }
  
  getConsultationStatus(consultation: ConsultationResponse): string {
    if (consultation.facture && consultation.diagnostic && consultation.traitement) {
      return 'Complétée';
    }
    return 'En cours';
  }
  
  getStatusClass(status: string): string {
    return status === 'Complétée' ? 'completed' : 'pending';
  }
  
  formatDate(date: any): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  formatTime(date: any): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'HH:mm') || '';
  }

  viewRendezVousDetails(rdv: any): void {
    const patientName = rdv.patientName || (rdv.patient ? `${rdv.patient.prenom} ${rdv.patient.nom}` : 'Inconnu');
    alert(`Rendez-vous #${rdv.idRendezVous}\n\nPatient: ${patientName}\nMotif: ${rdv.motif || 'N/A'}`);
  }

  createConsultationFromRdv(rdv: any): void {
    const userData = this.authService.getUserData();
    this.newConsultation = {
      type: 'Générale',
      dateConsultation: new Date().toISOString(),
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: rdv.remarque || '',
      idDossierMedical: 0,
      idMedecin: userData?.id || rdv.idMedecin || 0,
      idRendezVous: rdv.idRendezVous
    };
    this.showAddModal = true;
  }
  
  exportToPDF(consultation: ConsultationResponse): void {}
  exportAll(): void {}
  generateFacture(consultation: ConsultationResponse): void {}
  
  private createEmptyConsultation(): ConsultationRequest {
    return {
      type: '',
      dateConsultation: new Date().toISOString(),
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: '',
      idDossierMedical: 0,
      idMedecin: 0,
      idRendezVous: undefined
    };
  }
  
  private startDateUpdate(): void {
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }
}
