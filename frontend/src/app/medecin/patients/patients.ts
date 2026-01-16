import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DossierMedicalComponent } from '../../components/dossier-medical/dossier-medical';
import { DossierMedical, Patient as PatientMedical } from '../../models/dossier-medical.model';
import { RendezVousService, PatientInfo } from '../../services/rendez-vous';
import { AuthService } from '../../services/auth';

// Interface pour l'affichage des patients dans la liste
interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'actif' | 'suivi' | 'inactif';
  avatar: string;
  phone: string;
  email: string;
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  notes: string;
  dossierMedical?: DossierMedical;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DossierMedicalComponent],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss']
})
export class PatientsComponent implements OnInit {
  searchQuery: string = '';
  filterStatus: string = 'all';
  sortBy: string = 'name';
  
  // Variables pour gérer l'affichage du dossier médical
  showDossierMedical: boolean = false;
  selectedPatientId: number | null = null;
  selectedDossier: DossierMedical | null = null;
  selectedPatientName: string = '';
  
  isLoading: boolean = false;
  errorMessage: string = '';
  
  patients: Patient[] = [];
  
  // Données statiques pour référence (sera remplacé par les données de l'API)
  private staticPatients: Patient[] = [
    {
      id: 1,
      name: 'Jean Martin',
      age: 45,
      gender: 'Homme',
      lastVisit: '15/03/2024',
      nextAppointment: '22/03/2024',
      status: 'actif',
      avatar: '👨‍🦰',
      phone: '06 12 34 56 78',
      email: 'jean.martin@email.com',
      bloodGroup: 'A+',
      allergies: ['Pénicilline', 'Arachides'],
      chronicDiseases: ['Hypertension'],
      notes: 'Patient suivi pour hypertension. Traitement stable.',
      dossierMedical: {
        idDossier: 1,
        antMedicaux: 'Hypertension artérielle depuis 5 ans, Hypercholestérolémie',
        antChirurg: 'Appendicectomie (2010)',
        allergies: 'Pénicilline, Arachides',
        traitementEnCour: 'Amlodipine 5mg 1x/jour, Atorvastatine 20mg 1x/jour',
        habitudes: 'Non fumeur, Consommation alcool occasionnelle, Sport 2x/semaine',
        dateCreation: new Date('2023-01-15'),
        documentsMedicaux: ['bilan_cardio.pdf', 'analyse_sang.pdf'],
        patient: {
          idPatient: 1,
          nom: 'Martin',
          prenom: 'Jean',
          dateNaissance: new Date('1979-01-15'),
          genre: 'M',
          telephone: '06 12 34 56 78',
          email: 'jean.martin@email.com',
          adresse: '12 Rue de la Paix, 75001 Paris',
          groupeSanguin: 'A+'
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      } as DossierMedical
    },
    {
      id: 2,
      name: 'Marie Curie',
      age: 32,
      gender: 'Femme',
      lastVisit: '10/03/2024',
      nextAppointment: '25/03/2024',
      status: 'actif',
      avatar: '👩‍⚕️',
      phone: '06 23 45 67 89',
      email: 'marie.curie@email.com',
      bloodGroup: 'O-',
      allergies: ['Aucune'],
      chronicDiseases: ['Asthme'],
      notes: 'Asthme contrôlé. Vérifier l\'utilisation de l\'inhalateur.',
      dossierMedical: {
        idDossier: 2,
        antMedicaux: 'Asthme depuis l\'enfance',
        antChirurg: 'Aucun',
        allergies: 'Aucune',
        traitementEnCour: 'Ventoline si besoin',
        habitudes: 'Non fumeur',
        dateCreation: new Date('2023-02-20'),
        documentsMedicaux: ['spirometrie.pdf'],
        patient: {
          idPatient: 2,
          nom: 'Curie',
          prenom: 'Marie',
          dateNaissance: new Date('1992-05-15'),
          genre: 'F',
          telephone: '06 23 45 67 89',
          email: 'marie.curie@email.com',
          adresse: '24 Avenue des Sciences, 75005 Paris'
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      } as DossierMedical
    },
    {
      id: 3,
      name: 'Paul Durand',
      age: 68,
      gender: 'Homme',
      lastVisit: '28/02/2024',
      nextAppointment: '28/03/2024',
      status: 'suivi',
      avatar: '👨‍🦳',
      phone: '06 34 56 78 90',
      email: 'paul.durand@email.com',
      bloodGroup: 'B+',
      allergies: ['Sulfamides'],
      chronicDiseases: ['Diabète Type 2', 'Hypertension'],
      notes: 'Diabète équilibré. Continuer surveillance glycémique.',
      dossierMedical: {
        idDossier: 3,
        antMedicaux: 'Diabète Type 2 depuis 10 ans, Hypertension',
        antChirurg: 'Opération cataracte (2020)',
        allergies: 'Sulfamides',
        traitementEnCour: 'Metformine 850mg 2x/jour',
        habitudes: 'Tabac arrêté depuis 5 ans',
        dateCreation: new Date('2022-11-10'),
        documentsMedicaux: ['glycemie.pdf'],
        patient: {
          idPatient: 3,
          nom: 'Durand',
          prenom: 'Paul',
          dateNaissance: new Date('1956-08-22'),
          genre: 'M',
          telephone: '06 34 56 78 90',
          email: 'paul.durand@email.com',
          adresse: '8 Rue du Commerce, 75015 Paris'
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      } as DossierMedical
    },
    {
      id: 4,
      name: 'Sophie Bernard',
      age: 29,
      gender: 'Femme',
      lastVisit: '05/03/2024',
      nextAppointment: '19/03/2024',
      status: 'actif',
      avatar: '👩',
      phone: '06 45 67 89 01',
      email: 'sophie.bernard@email.com',
      bloodGroup: 'AB+',
      allergies: ['Latex'],
      chronicDiseases: [],
      notes: 'Consultation routine. Aucun problème particulier.',
      dossierMedical: {
        idDossier: 4,
        antMedicaux: 'Aucun',
        antChirurg: 'Aucun',
        allergies: 'Latex',
        traitementEnCour: 'Aucun',
        habitudes: 'Sportive, alimentation équilibrée',
        dateCreation: new Date('2024-01-10'),
        documentsMedicaux: [],
        patient: {
          idPatient: 4,
          nom: 'Bernard',
          prenom: 'Sophie',
          dateNaissance: new Date('1995-03-12'),
          genre: 'F',
          telephone: '06 45 67 89 01',
          email: 'sophie.bernard@email.com',
          adresse: '15 Boulevard Saint-Germain, 75006 Paris'
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      } as DossierMedical
    },
    {
      id: 5,
      name: 'Robert Lefevre',
      age: 55,
      gender: 'Homme',
      lastVisit: '12/02/2024',
      nextAppointment: 'À planifier',
      status: 'inactif',
      avatar: '👨',
      phone: '06 56 78 90 12',
      email: 'robert.lefevre@email.com',
      bloodGroup: 'A-',
      allergies: ['Iode'],
      chronicDiseases: ['Arthrose'],
      notes: 'Dernière consultation il y a plus d\'un mois.',
      dossierMedical: {
        idDossier: 5,
        antMedicaux: 'Arthrose genoux',
        antChirurg: 'Opération hernie discale (2018)',
        allergies: 'Iode',
        traitementEnCour: 'Anti-inflammatoires si douleur',
        habitudes: 'Sédentaire',
        dateCreation: new Date('2022-05-18'),
        documentsMedicaux: ['radio_genoux.pdf'],
        patient: {
          idPatient: 5,
          nom: 'Lefevre',
          prenom: 'Robert',
          dateNaissance: new Date('1969-11-30'),
          genre: 'M',
          telephone: '06 56 78 90 12',
          email: 'robert.lefevre@email.com',
          adresse: '32 Rue de Rivoli, 75004 Paris'
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      } as DossierMedical
    },
    {
      id: 6,
      name: 'Camille Dubois',
      age: 40,
      gender: 'Femme',
      lastVisit: '18/03/2024',
      nextAppointment: '15/04/2024',
      status: 'actif',
      avatar: '👩‍💼',
      phone: '06 67 89 01 23',
      email: 'camille.dubois@email.com',
      bloodGroup: 'O+',
      allergies: ['Aspirine'],
      chronicDiseases: ['Migraines chroniques'],
      notes: 'Migraines sous contrôle avec nouveau traitement.',
      dossierMedical: {
        idDossier: 6,
        antMedicaux: 'Migraines chroniques',
        antChirurg: 'Aucun',
        allergies: 'Aspirine',
        traitementEnCour: 'Sumatriptan 50mg si crise',
        habitudes: 'Stress professionnel',
        dateCreation: new Date('2023-09-05'),
        documentsMedicaux: ['scanner_cerebral.pdf'],
        patient: {
          idPatient: 6,
          nom: 'Dubois',
          prenom: 'Camille',
          dateNaissance: new Date('1984-07-18'),
          genre: 'F',
          telephone: '06 67 89 01 23',
          email: 'camille.dubois@email.com',
          adresse: '7 Avenue Montaigne, 75008 Paris'
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      } as DossierMedical
    }
  ];

  filteredPatients: Patient[] = [];

  constructor(
    private rendezVousService: RendezVousService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  /**
   * Charger les patients depuis l'API RendezVousMedecinPatient
   */
  loadPatients(): void {
    // Récupérer l'ID du médecin depuis les données utilisateur
    const userData = this.authService.getUserData();
    const idMedecin = userData?.id;

    if (!idMedecin) {
      console.error('ID médecin manquant dans les données utilisateur');
      this.errorMessage = 'Impossible de récupérer l\'ID du médecin.';
      this.isLoading = false;
      // Utiliser les données statiques en cas d'erreur
      this.patients = [...this.staticPatients];
      this.applyFilters();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.rendezVousService.getRendezVousMedecinPatient(idMedecin).subscribe({
      next: (data) => {
        console.log('Données reçues de l\'API:', data);
        // Mapper les données de l'API vers l'interface Patient
        this.patients = data.map(item => this.mapToPatient(item));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des patients:', error);
        this.errorMessage = error.error?.message || error.message || 'Erreur lors du chargement des patients.';
        this.isLoading = false;
        // Utiliser les données statiques en cas d'erreur
        this.patients = [...this.staticPatients];
    this.applyFilters();
      }
    });
  }

  /**
   * Mapper les données de l'API vers l'interface Patient
   */
  private mapToPatient(data: {patient: PatientInfo, rendezVousResponse: any[]}): Patient {
    const patientInfo = data.patient;
    const rendezVous = data.rendezVousResponse || [];
    
    // Trouver le dernier rendez-vous et le prochain
    const rendezVousTermines = rendezVous.filter(rdv => rdv.statut === 'TERMINE');
    const dernierRendezVous = rendezVousTermines.length > 0 
      ? rendezVousTermines.sort((a, b) => new Date(b.dateRdvs).getTime() - new Date(a.dateRdvs).getTime())[0]
      : null;
    
    const rendezVousFuturs = rendezVous.filter(rdv => 
      rdv.statut !== 'TERMINE' && new Date(rdv.dateRdvs) >= new Date()
    );
    const prochainRendezVous = rendezVousFuturs.length > 0
      ? rendezVousFuturs.sort((a, b) => new Date(a.dateRdvs).getTime() - new Date(b.dateRdvs).getTime())[0]
      : null;

    // Calculer l'âge à partir de la date de naissance
    const dateNaissance = new Date(patientInfo.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - dateNaissance.getFullYear();
    const monthDiff = today.getMonth() - dateNaissance.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateNaissance.getDate())) {
      age--;
    }

    // Formater la date du dernier rendez-vous
    const lastVisit = dernierRendezVous 
      ? this.formatDate(dernierRendezVous.dateRdvs)
      : 'Jamais';

    // Formater la date du prochain rendez-vous
    const nextAppointment = prochainRendezVous
      ? this.formatDate(prochainRendezVous.dateRdvs)
      : 'À planifier';

    // Déterminer le statut
    let status: 'actif' | 'suivi' | 'inactif' = 'inactif';
    if (rendezVousTermines.length > 0) {
      const dernierRdvDate = new Date(dernierRendezVous.dateRdvs);
      const joursDepuisDernierRdv = Math.floor((today.getTime() - dernierRdvDate.getTime()) / (1000 * 60 * 60 * 24));
      if (joursDepuisDernierRdv <= 30) {
        status = 'actif';
      } else if (joursDepuisDernierRdv <= 90) {
        status = 'suivi';
      }
    }

    return {
      id: patientInfo.idPatient,
      name: `${patientInfo.prenom} ${patientInfo.nom}`,
      age: age,
      gender: patientInfo.sexe === 'M' || patientInfo.sexe === 'HOMME' ? 'Homme' : 'Femme',
      lastVisit: lastVisit,
      nextAppointment: nextAppointment,
      status: status,
      avatar: patientInfo.sexe === 'M' || patientInfo.sexe === 'HOMME' ? '👨' : '👩',
      phone: patientInfo.numTel || '',
      email: '',
      bloodGroup: '',
      allergies: [],
      chronicDiseases: [],
      notes: '',
      dossierMedical: undefined
    };
  }

  /**
   * Formater une date au format DD/MM/YYYY
   */
  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Méthodes pour les statistiques
  getTotalPatients(): number {
    return this.patients.length;
  }

  getActivePatients(): number {
    return this.patients.filter(p => p.status === 'actif').length;
  }

  getScheduledAppointments(): number {
    return this.patients.filter(p => p.nextAppointment !== 'À planifier').length;
  }

  getChronicPatientsCount(): number {
    return this.patients.filter(p => p.chronicDiseases && p.chronicDiseases.length > 0).length;
  }

  applyFilters() {
    let filtered = [...this.patients];

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(query)
      );
    }

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === this.filterStatus);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return b.age - a.age;
        case 'lastVisit':
          return this.parseDate(b.lastVisit) - this.parseDate(a.lastVisit);
        default:
          return 0;
      }
    });

    this.filteredPatients = filtered;
  }

  private parseDate(dateStr: string): number {
    if (dateStr === 'À planifier') return 0;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'actif': return 'status-active';
      case 'suivi': return 'status-follow-up';
      case 'inactif': return 'status-inactive';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'actif': return 'Actif';
      case 'suivi': return 'Suivi';
      case 'inactif': return 'Inactif';
      default: return status;
    }
  }

  getDaysAgo(dateStr: string): string {
    if (dateStr === 'À planifier' || !dateStr) return '';
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  }

  getAgeCount(range: string): number {
    const ranges = {
      '18-30': (age: number) => age >= 18 && age <= 30,
      '31-50': (age: number) => age >= 31 && age <= 50,
      '51-70': (age: number) => age >= 51 && age <= 70,
      '70+': (age: number) => age > 70
    };
    
    if (!this.patients.length) return 0;
    return this.patients.filter(p => ranges[range as keyof typeof ranges](p.age)).length;
  }

  getAgePercentage(range: string): number {
    if (!this.patients.length) return 0;
    const count = this.getAgeCount(range);
    return (count / this.patients.length) * 100;
  }

  // Méthode pour afficher le dossier médical
  viewPatientDetails(patient: Patient) {
    this.selectedPatientId = patient.id;
    this.selectedPatientName = patient.name;
    this.selectedDossier = patient.dossierMedical || null;
    this.showDossierMedical = true;
  }

  // Méthode pour fermer le dossier médical
  closeDossierMedical() {
    this.showDossierMedical = false;
    this.selectedPatientId = null;
    this.selectedPatientName = '';
    this.selectedDossier = null;
  }

  // Méthode pour sauvegarder le dossier médical
  saveDossierMedical(dossier: DossierMedical) {
    console.log('Sauvegarde du dossier:', dossier);
    
    // Trouver le patient et mettre à jour son dossier
    const patientIndex = this.patients.findIndex(p => 
      p.dossierMedical?.idDossier === dossier.idDossier || 
      p.id === dossier.patient?.idPatient
    );
    
    if (patientIndex !== -1) {
      this.patients[patientIndex].dossierMedical = dossier;
      // Actualiser la liste filtrée
      this.applyFilters();
    }
    
    this.closeDossierMedical();
  }

  editPatient(patient: Patient) {
    console.log('Éditer patient:', patient);
    // Logique pour éditer le patient
    this.viewPatientDetails(patient);
  }

  createNewPatient() {
    console.log('Créer nouveau patient');
    // Créer un nouveau patient avec un dossier médical vide
    const newPatientId = Math.max(...this.patients.map(p => p.id), 0) + 1;
    const newPatient: Patient = {
      id: newPatientId,
      name: 'Nouveau Patient',
      age: 0,
      gender: 'Homme',
      lastVisit: 'Jamais',
      nextAppointment: 'À planifier',
      status: 'actif',
      avatar: '👤',
      phone: '',
      email: '',
      bloodGroup: '',
      allergies: [],
      chronicDiseases: [],
      notes: '',
      dossierMedical: {
        idDossier: Math.max(...this.patients.map(p => p.dossierMedical?.idDossier || 0), 0) + 1,
        antMedicaux: '',
        antChirurg: '',
        allergies: '',
        traitementEnCour: '',
        habitudes: '',
        dateCreation: new Date(),
        documentsMedicaux: [],
        patient: {
          idPatient: newPatientId,
          nom: 'Nouveau',
          prenom: 'Patient',
          dateNaissance: new Date(),
          genre: 'M',
          telephone: '',
          email: '',
          adresse: ''
        } as PatientMedical,
        consultations: [],
        idMedecin: 123
      }
    };
    
    this.patients.push(newPatient);
    this.applyFilters();
    this.viewPatientDetails(newPatient);
  }

  exportPatients() {
    console.log('Exporter la liste des patients');
    // Logique d'export
    const data = JSON.stringify(this.patients, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  sendReminder(patient: Patient) {
    console.log('Envoyer rappel à:', patient.name);
    // Logique d'envoi de rappel
    alert(`Rappel envoyé à ${patient.name} (${patient.phone})`);
  }

  // Méthode pour supprimer un patient
  deletePatient(patient: Patient, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${patient.name} ?`)) {
      const index = this.patients.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        this.patients.splice(index, 1);
        this.applyFilters();
      }
    }
  }

  // Méthode pour vérifier si un patient a un dossier médical
  hasDossierMedical(patient: Patient): boolean {
    return !!patient.dossierMedical;
  }

  // Méthode pour obtenir l'âge à partir de la date de naissance
  calculateAgeFromBirthDate(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Méthode pour mettre à jour l'âge d'un patient à partir de sa date de naissance
  updatePatientAgeFromDossier(patient: Patient) {
    if (patient.dossierMedical?.patient?.dateNaissance) {
      patient.age = this.calculateAgeFromBirthDate(patient.dossierMedical.patient.dateNaissance);
    }
  }
}