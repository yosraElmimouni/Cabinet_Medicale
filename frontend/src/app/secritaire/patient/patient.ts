import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderSec } from '../header-sec/header-sec';
import { DossierMedicalComponent } from '../../components/dossier-medical/dossier-medical';
import { DossierMedical } from '../../models/dossier-medical.model';
import { PatientService, PatientResponse, PatientRequest } from '../../services/patient';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

export interface Patient {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string; // M ou F
  numTel: string;
  typeMutuelle: string;
  autreMutuelle?: string;
  idSecretaire?: number;
}

@Component({
  selector: 'app-patient',
  imports: [FormsModule, CommonModule, DossierMedicalComponent],
  templateUrl: './patient.html',
  styleUrl: './patient.scss',
})
export class PatientComponent implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  searchTerm: string = '';
  showAddForm: boolean = false;
  isEditing: boolean = false;
  viewMode: 'list' | 'grid' = 'list';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Calcul de la date maximale pour la date de naissance (aujourd'hui - 120 ans)
  maxBirthDate: string = new Date(new Date().getFullYear() , 0, 1).toISOString().split('T')[0];

  // Nouveau patient
  newPatient: Patient = {
    id: 0,
    cin: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: '',
    numTel: '',
    typeMutuelle: ''
  };

  // Liste des patients
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  // Dossier médical
  showDossier: boolean = false;
  selectedPatientForDossier: Patient | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPatients();
    
    // Mettre à jour l'heure chaque minute
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadPatients() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.patientService.getAllPatients().subscribe({
      next: (patientsResponse: PatientResponse[]) => {
        // Convertir les données de l'API vers le format du composant
        this.patients = patientsResponse.map(p => this.mapToPatient(p));
        this.filteredPatients = [...this.patients];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des patients:', error);
        this.errorMessage = 'Erreur lors du chargement des patients. Veuillez réessayer.';
        this.isLoading = false;
        // En cas d'erreur, initialiser avec un tableau vide
        this.patients = [];
        this.filteredPatients = [];
      }
    });
    
    this.subscriptions.add(sub);
  }

  // Mapper PatientResponse vers Patient
  private mapToPatient(response: PatientResponse): Patient {
    return {
      id: response.idPatient,
      cin: response.cin,
      nom: response.nom,
      prenom: response.prenom,
      dateNaissance: response.dateNaissance,
      sexe: this.normalizeSexe(response.sexe), // Convertir HOMME/FEMME en M/F
      numTel: response.numTel || '', // Gérer le cas null
      typeMutuelle: response.typeMutuelle || '',
      idSecretaire: response.idSecretaire
    };
  }

  // Normaliser le sexe : HOMME -> M, FEMME -> F
  private normalizeSexe(sexe: string): string {
    if (sexe === 'HOMME' || sexe === 'M' || sexe === 'Masculin') return 'M';
    if (sexe === 'FEMME' || sexe === 'F' || sexe === 'Féminin') return 'F';
    return sexe; // Retourner tel quel si non reconnu
  }

  // Convertir M/F vers HOMME/FEMME pour l'API
  private convertSexeForAPI(sexe: string): string {
    if (sexe === 'M' || sexe === 'Masculin') return 'HOMME';
    if (sexe === 'F' || sexe === 'Féminin') return 'FEMME';
    return sexe;
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredPatients = [...this.patients];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPatients = this.patients.filter(patient =>
        patient.nom.toLowerCase().includes(term) ||
        patient.prenom.toLowerCase().includes(term) ||
        patient.cin.toLowerCase().includes(term) ||
        patient.numTel.includes(term)
      );
    }
  }

  onSubmit() {
    // Si le type de mutuelle est "Autre", utiliser la valeur du champ autreMutuelle
    if (this.newPatient.typeMutuelle === 'Autre' && this.newPatient.autreMutuelle) {
      this.newPatient.typeMutuelle = this.newPatient.autreMutuelle;
    }

    // Récupérer l'ID du secrétaire depuis les données utilisateur
    const userData = this.authService.getUserData();
    const idSecretaire = userData?.id || 0;

    if (!idSecretaire) {
      this.errorMessage = 'Impossible de récupérer les informations du secrétaire.';
      return;
    }

    // Préparer les données pour l'API
    const patientRequest: PatientRequest = {
      cin: this.newPatient.cin,
      nom: this.newPatient.nom,
      prenom: this.newPatient.prenom,
      sexe: this.convertSexeForAPI(this.newPatient.sexe),
      numTel: this.newPatient.numTel || '',
      typeMutuelle: this.newPatient.typeMutuelle || '',
      dateNaissance: this.newPatient.dateNaissance,
      idSecretaire: idSecretaire
    };

    this.isLoading = true;
    this.errorMessage = '';

    let operation$;
    
    if (this.isEditing && this.newPatient.id) {
      // Modifier un patient existant
      operation$ = this.patientService.updatePatient(this.newPatient.id, patientRequest);
    } else {
      // Créer un nouveau patient
      operation$ = this.patientService.createPatient(patientRequest);
    }

    const sub = operation$.subscribe({
      next: (response: PatientResponse) => {
        this.isLoading = false;
        this.errorMessage = '';
        
        // Afficher le message de succès
        this.successMessage = `Patient ${response.prenom} ${response.nom} ${this.isEditing ? 'modifié' : 'créé'} avec succès !`;
        
        // Fermer le formulaire immédiatement
        this.resetForm();
        this.showAddForm = false;
        
        // Recharger la liste des patients
        this.loadPatients();
        this.onSearch();
        
        // Faire disparaître le message de succès après 5 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'opération:', error);
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage = error.error?.message || `Erreur lors de ${this.isEditing ? 'la modification' : 'l\'ajout'} du patient.`;
      }
    });

    this.subscriptions.add(sub);
  }

  onCancel() {
    if (confirm('Voulez-vous vraiment annuler? Toutes les données saisies seront perdues.')) {
      this.resetForm();
      this.showAddForm = false;
    }
  }

  resetForm() {
    this.newPatient = {
      id: 0,
      cin: '',
      nom: '',
      prenom: '',
      dateNaissance: '',
      sexe: '',
      numTel: '',
      typeMutuelle: ''
    };
    this.isEditing = false;
  }

  editPatient(patient: Patient) {
    this.newPatient = {...patient};
    
    // Si la mutuelle n'est pas dans la liste prédéfinie, la mettre comme "Autre"
    const predefinedMutuelle = ['CNOPS', 'CNSS', 'RAMED', 'Assurance Privée', ''];
    if (patient.typeMutuelle && !predefinedMutuelle.includes(patient.typeMutuelle)) {
      this.newPatient.autreMutuelle = patient.typeMutuelle;
      this.newPatient.typeMutuelle = 'Autre';
    }
    
    this.isEditing = true;
    this.showAddForm = true;
  }

  deletePatient(patient: Patient) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patient.prenom} ${patient.nom}? Cette action est irréversible.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const sub = this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.isLoading = false;
          alert(`Patient ${patient.prenom} ${patient.nom} supprimé avec succès!`);
          
          // Recharger la liste des patients
          this.loadPatients();
      this.onSearch();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression du patient.';
        }
      });
      
      this.subscriptions.add(sub);
    }
  }

  viewMedicalRecord(patient: Patient) {
    // Ouvrir le formulaire du dossier médical pour le patient sélectionné
    this.selectedPatientForDossier = patient;
    this.showDossier = true;
  }

  handleDossierSubmit(dossier: DossierMedical) {
    console.log('Dossier soumis pour patient', dossier);
    // Ici on pourrait appeler un service pour sauvegarder le dossier
    this.showDossier = false;
  }

  closeDossier() {
    this.showDossier = false;
    this.selectedPatientForDossier = null;
  }

  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getRandomDate(): Date {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}