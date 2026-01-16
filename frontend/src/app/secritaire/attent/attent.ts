import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVousService, RendezVousDetailsResponse, PatientInfo, RendezVousConsultation } from '../../services/rendez-vous';
import { UserService, UserResponse } from '../../services/user';
import { AuthService } from '../../services/auth';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface Patient {
  id: number;
  idRendezVous?: number; // ID du rendez-vous pour pouvoir le terminer
  nom: string;
  prenom: string;
  age: number;
  medecin: string;
  heureArrivee: Date;
  tempsAttente: number;
  urgence: 'faible' | 'moyenne' | 'élevée' | 'critique';
  statut: 'en-attente' | 'appelé' | 'en-consultation';
  telephone?: string;
  role: 'normal' | 'prioritaire' | 'urgence';
  rdvConfirme: boolean;
}

interface Stats {
  totalEnAttente: number;
  tempsMoyenAttente: number;
  prochainPatient: string;
  medecinsDisponibles: number;
}

@Component({
  selector: 'app-attent',
  imports: [CommonModule, FormsModule],
  templateUrl: './attent.html',
  styleUrl: './attent.scss',
})
export class Attent implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  searchTerm: string = '';
  
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  patientActuel: Patient | null = null;

  filterUrgence: string = '';
  filterStatut: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  stats: Stats = {
    totalEnAttente: 0,
    tempsMoyenAttente: 0,
    prochainPatient: '',
    medecinsDisponibles: 3
  };

  private subscriptions: Subscription = new Subscription();
  private medecinsMap: Map<number, string> = new Map(); // Cache des médecins

  constructor(
    private rendezVousService: RendezVousService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRendezVousEnAttente();
    
    // Mettre à jour le temps
    setInterval(() => {
      this.currentTime = new Date();
      this.updateTempsAttente();
    }, 60000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRendezVousEnAttente() {
    // Récupérer l'ID du secrétaire depuis les données utilisateur
    const userData = this.authService.getUserData();
    const idSecretaire = userData?.id || 0;

    console.log('Chargement des rendez-vous en attente pour le secrétaire:', idSecretaire);
    console.log('Données utilisateur:', userData);

    if (!idSecretaire) {
      this.errorMessage = 'Impossible de récupérer les informations du secrétaire.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Récupérer les rendez-vous détaillés
    const sub = this.rendezVousService.getRendezVousDetailsBySecretaireId(idSecretaire).subscribe({
      next: (detailsResponse: any) => {
        console.log('Réponse reçue du service:', detailsResponse);
        console.log('Type de la réponse:', Array.isArray(detailsResponse) ? 'Array' : typeof detailsResponse);
        if (detailsResponse.length > 0) {
          console.log('Premier élément:', detailsResponse[0]);
          console.log('Structure du premier élément:', Object.keys(detailsResponse[0]));
        }
        
        // Filtrer uniquement les rendez-vous avec statut EN_ATTENTE
        const rdvsEnAttente: Array<{ rdv: any, patient: PatientInfo }> = [];
        const medecinIds = new Set<number>();
        
        try {
          // Structure de la réponse: [{patient: {...}, rendezVousResponse: [...]}, ...]
          detailsResponse.forEach((item: any) => {
            const patient = item.patient;
            const rendezVousList = item.rendezVousResponse || [];
            
            if (!patient) {
              console.warn('Patient manquant dans la réponse:', item);
              return;
            }
            
            // Pour chaque rendez-vous dans la réponse
            rendezVousList.forEach((rdv: any) => {
              // Filtrer uniquement les rendez-vous avec statut EN_ATTENTE
              const statut = rdv.statut?.toUpperCase() || '';
              if (statut === 'EN_ATTENTE' || statut === 'EN ATTENTE') {
                rdvsEnAttente.push({
                  rdv: rdv,
                  patient: patient
                });
                
                // Collecter les IDs des médecins
                if (rdv.idMedecin) {
                  medecinIds.add(rdv.idMedecin);
                }
              }
            });
          });

          console.log('Rendez-vous en attente trouvés:', rdvsEnAttente.length);
          console.log('IDs des médecins à charger:', Array.from(medecinIds));

          // Charger les médecins d'abord
          this.loadMedecinsByIds(Array.from(medecinIds)).then(() => {
            // Mapper les rendez-vous vers Patient
            this.patients = rdvsEnAttente.map(({ rdv, patient }) => 
              this.mapRendezVousToPatient(rdv, patient)
            );

    this.trierPatients();
    this.updateStats();
    this.patientActuel = this.patients.find(p => p.statut === 'appelé') || null;
    this.applyFilters();
            this.isLoading = false;
          }).catch(err => {
            console.error('Erreur lors du chargement des médecins:', err);
            this.errorMessage = 'Erreur lors du chargement des informations des médecins.';
            this.isLoading = false;
          });
        } catch (error: any) {
          console.error('Erreur lors du traitement des données:', error);
          this.errorMessage = 'Erreur lors du traitement des données des rendez-vous.';
          this.isLoading = false;
          this.patients = [];
          this.filteredPatients = [];
        }
      },
      error: (error: any) => {
        console.error('Erreur détaillée lors du chargement des rendez-vous:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        this.errorMessage = error.error?.message || error.message || 'Erreur lors du chargement des rendez-vous en attente.';
        this.isLoading = false;
        this.patients = [];
        this.filteredPatients = [];
      }
    });
    
    this.subscriptions.add(sub);
  }

  // Charger les médecins à partir de leurs IDs
  private loadMedecinsByIds(medecinIds: number[]): Promise<void> {
    if (medecinIds.length === 0) {
      return Promise.resolve();
    }

    // Créer un tableau d'observables pour récupérer chaque médecin
    const medecinRequests = medecinIds.map(id => 
      this.userService.getUserById(id).pipe(
        map(user => ({ id, name: `Dr. ${user.prenom} ${user.nom}` })),
        catchError(error => {
          console.error(`Erreur lors de la récupération du médecin ${id}:`, error);
          return of({ id, name: 'Médecin inconnu' });
        })
      )
    );

    // Exécuter toutes les requêtes en parallèle
    return new Promise((resolve) => {
      const sub = forkJoin(medecinRequests).subscribe({
        next: (medecins) => {
          medecins.forEach(medecin => {
            this.medecinsMap.set(medecin.id, medecin.name);
          });
          resolve();
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des médecins:', error);
          resolve();
        }
      });
      this.subscriptions.add(sub);
    });
  }

  // Mapper RendezVous vers Patient
  private mapRendezVousToPatient(rdv: any, patientInfo: PatientInfo): Patient {
    // Récupérer l'ID du rendez-vous
    const idRendezVous = rdv.idRendezVous || rdv.id;
    const now = new Date();
    
    // Calculer l'heure d'arrivée et le temps d'attente
    let heureArrivee: Date;
    let tempsAttente: number;
    
    if (rdv.dateRdvs && rdv.heureDebut) {
      // Extraire l'heure de début (HH:mm ou HH:mm:ss)
      let heureStr: string;
      if (typeof rdv.heureDebut === 'string') {
        heureStr = rdv.heureDebut.split(':').slice(0, 2).join(':');
      } else {
        heureStr = `${rdv.heureDebut.getHours().toString().padStart(2, '0')}:${rdv.heureDebut.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // Extraire les heures et minutes
      const [heures, minutes] = heureStr.split(':').map(Number);
      
      // Créer une date avec la date d'aujourd'hui et l'heure de début du rendez-vous
      const todayWithRdvTime = new Date();
      todayWithRdvTime.setHours(heures, minutes, 0, 0);
      todayWithRdvTime.setSeconds(0, 0);
      
      // L'heure d'arrivée est l'heure de début du rendez-vous
      heureArrivee = new Date(todayWithRdvTime);
      
      // Calculer le TEMPS RESTANT jusqu'au début du rendez-vous
      // Si l'heure de début est dans le futur : calculer la différence (temps restant)
      // Si l'heure de début est passée : temps d'attente = 0 (le rendez-vous a déjà commencé)
      if (todayWithRdvTime.getTime() > now.getTime()) {
        // L'heure de début est dans le futur : calculer le temps restant
        const diffMs = todayWithRdvTime.getTime() - now.getTime();
        tempsAttente = Math.max(0, Math.floor(diffMs / 60000));
      } else {
        // L'heure de début est passée : le rendez-vous a déjà commencé
        tempsAttente = 0;
      }
    } else {
      // Si pas de date/heure, utiliser maintenant
      heureArrivee = new Date();
      tempsAttente = 0;
    }

    // Calculer l'âge du patient
    const age = this.calculateAge(patientInfo.dateNaissance);

    // Déterminer l'urgence (par défaut moyenne, peut être ajustée)
    const urgence: 'faible' | 'moyenne' | 'élevée' | 'critique' = 'moyenne';

    // Déterminer le rôle (par défaut normal)
    const role: 'normal' | 'prioritaire' | 'urgence' = 'normal';

    return {
      id: patientInfo.idPatient,
      idRendezVous: rdv.idRendezVous, // ID du rendez-vous pour pouvoir le terminer
      nom: patientInfo.nom,
      prenom: patientInfo.prenom,
      age: age,
      medecin: this.medecinsMap.get(rdv.idMedecin || 0) || 'Médecin non assigné',
      heureArrivee: heureArrivee,
      tempsAttente: tempsAttente,
      urgence: urgence,
      statut: 'en-attente' as const,
      telephone: patientInfo.numTel || undefined,
      role: role,
      rdvConfirme: true // Les rendez-vous sont toujours confirmés
    };
  }

  // Calculer l'âge à partir de la date de naissance
  private calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Trier par priorité simple
  trierPatients() {
    this.patients.sort((a, b) => {
      // Patient appelé toujours en premier
      if (a.statut === 'appelé' && b.statut !== 'appelé') return -1;
      if (b.statut === 'appelé' && a.statut !== 'appelé') return 1;
      
      // RDV confirmé en priorité (interne)
      if (a.rdvConfirme && !b.rdvConfirme) return -1;
      if (!a.rdvConfirme && b.rdvConfirme) return 1;
      
      // Urgence
      const urgenceOrder = { 'critique': 4, 'élevée': 3, 'moyenne': 2, 'faible': 1 };
      if (urgenceOrder[a.urgence] !== urgenceOrder[b.urgence]) {
        return urgenceOrder[b.urgence] - urgenceOrder[a.urgence];
      }
      
      // Rôle
      const roleOrder = { 'urgence': 3, 'prioritaire': 2, 'normal': 1 };
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return roleOrder[b.role] - roleOrder[a.role];
      }
      
      // Temps d'attente
      return b.tempsAttente - a.tempsAttente;
    });
  }

  updateTempsAttente() {
    const now = new Date();
    this.patients.forEach(patient => {
      if (patient.statut === 'en-attente' || patient.statut === 'appelé') {
        // Calculer le TEMPS RESTANT jusqu'au début du rendez-vous
        // Si l'heure d'arrivée (heure de début du RDV) est dans le futur : calculer le temps restant
        // Si l'heure d'arrivée est passée : temps d'attente = 0 (le rendez-vous a déjà commencé)
        if (patient.heureArrivee.getTime() > now.getTime()) {
          const diffMs = patient.heureArrivee.getTime() - now.getTime();
          patient.tempsAttente = Math.max(0, Math.floor(diffMs / 60000));
        } else {
          patient.tempsAttente = 0;
        }
      }
    });
    this.trierPatients();
    this.updateStats();
    this.applyFilters();
  }

  updateStats() {
    const patientsEnAttente = this.patients.filter(p => p.statut === 'en-attente');
    const tempsMoyen = patientsEnAttente.length > 0 
      ? Math.round(patientsEnAttente.reduce((sum, p) => sum + p.tempsAttente, 0) / patientsEnAttente.length)
      : 0;
    
    const prochain = patientsEnAttente[0];

    this.stats = {
      totalEnAttente: patientsEnAttente.length,
      tempsMoyenAttente: tempsMoyen,
      prochainPatient: prochain ? prochain.prenom : 'Aucun',
      medecinsDisponibles: 3
    };
  }

  applyFilters() {
    let filtered = [...this.patients];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.nom.toLowerCase().includes(term) ||
        patient.prenom.toLowerCase().includes(term)
      );
    }

    if (this.filterUrgence) {
      filtered = filtered.filter(patient => patient.urgence === this.filterUrgence);
    }

    if (this.filterStatut) {
      filtered = filtered.filter(patient => patient.statut === this.filterStatut);
    }

    this.filteredPatients = filtered;
  }

  // Actions principales
  appelerPatient(patient: Patient) {
    if (patient.statut === 'en-attente') {
      // Remettre l'ancien patient appelé en attente
      this.patients.forEach(p => {
        if (p.statut === 'appelé') p.statut = 'en-attente';
      });
      
      patient.statut = 'appelé';
      this.patientActuel = patient;
      this.trierPatients();
      this.updateStats();
      this.applyFilters();
    }
  }

  appelerProchainPatient() {
    const prochain = this.patients.find(p => p.statut === 'en-attente');
    if (prochain) {
      this.appelerPatient(prochain);
    }
  }

  demarrerConsultation(patient: Patient) {
    if (patient.statut === 'appelé' && patient.idRendezVous) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Appeler le contrôleur pour terminer le rendez-vous
      const sub = this.rendezVousService.terminerRendezVous(patient.idRendezVous).subscribe({
        next: () => {
          // Mettre à jour le statut localement
          patient.statut = 'en-consultation';
          this.patientActuel = null;
          this.trierPatients();
          this.updateStats();
          this.applyFilters();
          this.isLoading = false;
          
          console.log('Rendez-vous terminé avec succès');
        },
        error: (error: any) => {
          console.error('Erreur lors de la finalisation du rendez-vous:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la finalisation du rendez-vous.';
          this.isLoading = false;
        }
      });
      
      this.subscriptions.add(sub);
    } else if (!patient.idRendezVous) {
      console.warn('ID du rendez-vous manquant pour le patient:', patient);
      this.errorMessage = 'Impossible de terminer le rendez-vous: ID manquant.';
    }
  }

  envoyerWhatsApp(patient: Patient) {
    if (patient.telephone) {
      const message = encodeURIComponent(
        `Bonjour ${patient.prenom},\nLe médecin est prêt à vous recevoir.`
      );
      window.open(`https://wa.me/${patient.telephone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  }

  rafraichirListe() {
    this.loadRendezVousEnAttente();
  }

  // Méthodes utilitaires
  getUrgenceClass(urgence: string): string {
    switch(urgence) {
      case 'critique': return 'critique';
      case 'élevée': return 'elevee';
      case 'moyenne': return 'moyenne';
      case 'faible': return 'faible';
      default: return 'faible';
    }
  }

  getStatutText(statut: string): string {
    switch(statut) {
      case 'appelé': return 'À APPELER';
      case 'en-consultation': return 'EN COURS';
      default: return 'EN ATTENTE';
    }
  }

  getProgressWidth(tempsAttente: number): number {
    const temps = Math.min(tempsAttente, 60);
    return (temps / 60) * 100;
  }

  // Formater le temps d'attente en heures et minutes
  formatTempsAttente(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${heures}h`;
    }
    return `${heures}h ${mins}min`;
  }
}