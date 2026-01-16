import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Patient, 
  DossierMedical, 
  Consultation
} from '../../models/dossier-medical.model';

@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossier-medical.html',
  styleUrls: ['./dossier-medical.scss']
})
export class DossierMedicalComponent implements OnInit {
  // Data
  patients: Patient[] = [];
  dossiers: DossierMedical[] = [];
  filteredPatients: Patient[] = [];
  
  // Selected items
  selectedPatient: Patient | null = null;
  selectedDossier: DossierMedical | null = null;
  
  // UI State
  expandedConsultations: Set<number> = new Set();
  activeTab: string = 'dossier';
  searchTerm: string = '';
  filterStatus: string = 'all';
  filterDate: string = 'all';

  ngOnInit() {
    this.loadSampleData();
    this.filteredPatients = [...this.patients];
  }

  loadSampleData() {
    // Load patients
    this.patients = [
      {
        idPatient: 1,
        nom: 'Martin',
        prenom: 'Sophie',
        dateNaissance: new Date('1985-03-15'),
        genre: 'F',
        telephone: '06 12 34 56 78',
        email: 'sophie.martin@email.com',
        adresse: '123 Rue de Paris, 75001 Paris',
        groupeSanguin: 'A+',
        assuranceMedicale: 'Mutuelles du Sud',
        numeroAssurance: 'MS12345678',
        status: 'actif',
        lastVisit: '15/01/2024',
        allergies: ['Penicilline', 'Arachides'],
        chronicDiseases: ['Hypertension'],
        notes: 'Patient suivi régulièrement. Bonne observance thérapeutique.'
      },
      {
        idPatient: 2,
        nom: 'Dubois',
        prenom: 'Pierre',
        dateNaissance: new Date('1978-07-22'),
        genre: 'M',
        telephone: '06 98 76 54 32',
        email: 'pierre.dubois@email.com',
        adresse: '45 Avenue Victor Hugo, 69002 Lyon',
        groupeSanguin: 'O-',
        assuranceMedicale: 'Harmonie Mutuelle',
        numeroAssurance: 'HM87654321',
        status: 'suivi',
        lastVisit: '10/01/2024',
        allergies: ['Aspirine'],
        chronicDiseases: ['Diabète Type 2'],
        notes: 'Contrôle trimestriel nécessaire. Surveillance glycémique.'
      },
      {
        idPatient: 3,
        nom: 'Leroy',
        prenom: 'Marie',
        dateNaissance: new Date('1992-11-30'),
        genre: 'F',
        telephone: '07 23 45 67 89',
        email: 'marie.leroy@email.com',
        adresse: '78 Boulevard Saint-Germain, 75006 Paris',
        groupeSanguin: 'B+',
        assuranceMedicale: 'MGEN',
        numeroAssurance: 'MG98765432',
        status: 'actif',
        lastVisit: '05/12/2023',
        allergies: [],
        chronicDiseases: []
      }
    ];

    // Load medical records with consultations
    this.dossiers = [
      {
        idDossier: 1,
        antMedicaux: 'Hypertension diagnostiquée en 2020. Antécédents familiaux de maladies cardiovasculaires (père infarctus à 65 ans).',
        antChirurg: 'Appendicectomie en 2005. Chirurgie de la cataracte en 2021.',
        allergies: 'Penicilline, Arachides, Pollen de bouleau',
        traitementEnCour: 'Bêta-bloquants 25mg/jour, IEC (Lisinopril 10mg), Statines (Atorvastatine 20mg)',
        habitudes: 'Non fumeuse. Alcool occasionnel (1-2 verres de vin/semaine). Pratique la marche 30min/jour. Alimentation équilibrée.',
        dateCreation: new Date('2020-03-15'),
        documentsMedicaux: [
          'ordonnance_hypertension_012024.pdf',
          'analyse_sanguine_jan2024.pdf',
          'ecg_2023_12.png',
          'radio_thorax_2023.jpg',
          'certificat_aptitude_sport.pdf'
        ],
        patient: this.patients[0],
        idPatient: 1,
        consultations: [
          {
            idConsultation: 1,
            type: 'Consultation de contrôle',
            dateConsultation: new Date('2024-01-15T10:30:00'),
            examenClinique: 'TA: 13/8, FC: 72 bpm, Poids: 68kg (-1kg), Taille: 165cm, IMC: 25.0',
            examenSupplementaire: 'Prise de sang: HbA1c 5.8%, Cholestérol total 1.8g/L, LDL 1.0g/L',
            diagnostic: 'Hypertension artérielle bien contrôlée sous traitement',
            traitement: 'Continuation du traitement actuel. Surveiller tension 2x/semaine.',
            observations: 'Patient en bonne forme générale. Hygiène de vie satisfaisante. Pas d\'effet secondaire rapporté.',
            motif: 'Contrôle semestriel de l\'hypertension',
            prescription: 'Renouvellement traitement: Lisinopril 10mg 1cp/jour, Atorvastatine 20mg 1cp/soir',
            examensDemandes: ['Bilan lipidique', 'Créatininémie'],
            idMedecin: 1,
            idPatient: 1,
            idDossierMedical: 1,
            nomMedecin: 'Dr. Bernard',
            facture: { idFacture: 1, montant: 25, statut: 'payée' }
          },
          {
            idConsultation: 2,
            type: 'Consultation urgente',
            dateConsultation: new Date('2023-11-20T14:00:00'),
            examenClinique: 'TA: 16/10, FC: 85 bpm, Céphalées frontales, Vertiges',
            examenSupplementaire: 'ECG: normal, Glycémie capillaire: 1.1g/L',
            diagnostic: 'Poussée hypertensive avec symptomatologie',
            traitement: 'Augmentation Lisinopril 20mg/jour. Repos strict. Consultation cardiologue sous 48h.',
            observations: 'Patient stressé par situation professionnelle. À surveiller étroitement.',
            idMedecin: 1,
            idPatient: 1,
            idDossierMedical: 1,
            nomMedecin: 'Dr. Bernard',
            facture: { idFacture: 2, montant: 35, statut: 'payée' }
          }
        ],
        idMedecin: 1,
        typeMutuelle: 'Mutuelles du Sud - Optique + Dentaire'
      },
      {
        idDossier: 2,
        antMedicaux: 'Diabète type 2 diagnostiqué en 2018. Hypercholestérolémie familiale.',
        antChirurg: 'Chirurgie du genou droit en 2015 suite à accident de ski (ligaments croisés).',
        allergies: 'Aspirine, Iodine',
        traitementEnCour: 'Metformine 850mg 2x/jour, Atorvastatine 20mg/jour, IEC',
        habitudes: 'Ancien fumeur (20 paquets-années, arrêté en 2015). Alcool modéré (3-4 verres/semaine). Sédentaire (travail de bureau).',
        dateCreation: new Date('2018-07-22'),
        documentsMedicaux: [
          'bilan_diabete_012024.pdf',
          'radio_genou_2020.jpg',
          'ordonnance_metformine.pdf',
          'analyse_urinaire.pdf'
        ],
        patient: this.patients[1],
        idPatient: 2,
        consultations: [
          {
            idConsultation: 3,
            type: 'Consultation diabétologique',
            dateConsultation: new Date('2024-01-10T09:00:00'),
            examenClinique: 'Glycémie à jeun: 1.2g/L, TA: 13/8, Poids: 85kg, Taille: 178cm, IMC: 26.8',
            examenSupplementaire: 'HbA1c: 6.5%, Microalbuminurie: négative, Créatinine: 85 µmol/L',
            diagnostic: 'Diabète type 2 équilibré sous traitement. Syndrome métabolique.',
            traitement: 'Continuation Metformine. Recommandation activité physique: 30min marche/jour. Consultation diététicienne.',
            observations: 'Contrôle glycémique satisfaisant. Perte de poids nécessaire (objectif -5kg).',
            idMedecin: 1,
            idPatient: 2,
            idDossierMedical: 2,
            nomMedecin: 'Dr. Bernard',
            facture: { idFacture: 3, montant: 30, statut: 'en attente' }
          }
        ],
        idMedecin: 1,
        typeMutuelle: 'Harmonie Mutuelle - Formule Confort'
      }
    ];
  }

  // Statistics methods
  getStats() {
    const totalPatients = this.patients.length;
    const totalDossiers = this.dossiers.length;
    const totalConsultations = this.getTotalConsultations();
    const consultationsToday = this.getConsultationsToday();
    const totalDocuments = this.getTotalDocuments();
    const completeDossiers = this.getCompleteDossiers();
    const dossierCompletion = totalDossiers > 0 ? Math.round((completeDossiers / totalDossiers) * 100) : 0;

    return {
      totalPatients,
      totalDossiers,
      totalConsultations,
      consultationsToday,
      totalDocuments,
      completeDossiers,
      dossierCompletion,
      newPatients: 2, // Simulated data
      newDocuments: 5, // Simulated data
      consultationsTrend: 12 // Simulated data
    };
  }

  getTotalConsultations(): number {
    return this.dossiers.reduce((total, dossier) => {
      return total + (dossier.consultations?.length || 0);
    }, 0);
  }

  getConsultationsToday(): number {
    const today = new Date().toDateString();
    return this.dossiers.reduce((total, dossier) => {
      const consultations = dossier.consultations || [];
      return total + consultations.filter(c => 
        new Date(c.dateConsultation).toDateString() === today
      ).length;
    }, 0);
  }

  getTotalDocuments(): number {
    return this.dossiers.reduce((total, dossier) => {
      return total + (dossier.documentsMedicaux?.length || 0);
    }, 0);
  }

  getCompleteDossiers(): number {
    return this.dossiers.filter(dossier => 
      (dossier.consultations?.length || 0) > 0 &&
      (dossier.documentsMedicaux?.length || 0) > 0 &&
      dossier.antMedicaux &&
      dossier.allergies &&
      dossier.traitementEnCour
    ).length;
  }

  // Patient methods
  getPatientDossier(patientId: number): DossierMedical | null {
    return this.dossiers.find(d => d.idPatient === patientId) || null;
  }

  getPatientDossierCount(patientId: number): number {
    return this.dossiers.filter(d => d.idPatient === patientId).length;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getAge(date: Date): number {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Search and filter methods
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = [...this.patients];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(patient => 
      patient.nom.toLowerCase().includes(term) ||
      patient.prenom.toLowerCase().includes(term) ||
      patient.telephone.includes(term) ||
      patient.email?.toLowerCase().includes(term) ||
      patient.adresse.toLowerCase().includes(term)
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredPatients = [...this.patients];
  }

  applyFilters() {
    // Filter logic based on filterStatus and filterDate
    this.filteredPatients = [...this.patients];
    
    // Apply status filter
    if (this.filterStatus !== 'all') {
      this.filteredPatients = this.filteredPatients.filter(patient => {
        const dossier = this.getPatientDossier(patient.idPatient);
        switch(this.filterStatus) {
          case 'active':
            return patient.status === 'actif';
          case 'recent':
            return dossier?.dateCreation && 
                   this.isRecent(dossier.dateCreation, 7);
          case 'urgent':
            return dossier?.consultations?.some(c => 
              c.facture?.statut === 'en attente'
            );
          case 'complete':
            return this.getDossierStatus(dossier) === 'complet';
          default:
            return true;
        }
      });
    }
  }

  isRecent(date: Date, days: number): boolean {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }

  // Dossier methods
  selectPatient(patient: Patient) {
    this.selectedPatient = patient;
    this.selectedDossier = this.getPatientDossier(patient.idPatient);
    this.activeTab = 'dossier';
    this.expandedConsultations.clear();
  }

  getDossierStatus(dossier: DossierMedical | null): string {
    if (!dossier) return 'incomplet';
    
    const hasConsultations = (dossier.consultations?.length || 0) > 0;
    const hasDocuments = (dossier.documentsMedicaux?.length || 0) > 0;
    const hasEssentialInfo = dossier.antMedicaux && dossier.allergies && dossier.traitementEnCour;
    
    return (hasConsultations && hasDocuments && hasEssentialInfo) ? 'complet' : 'incomplet';
  }

  // Document methods
  getDocumentType(filename: string): string {
    if (filename.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) return 'image';
    if (filename.toLowerCase().match(/\.(doc|docx)$/)) return 'word';
    return 'other';
  }

  getDocumentName(filename: string): string {
    // Remove extension and replace underscores
    return filename.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
  }

  getDocumentSize(): string {
    // Simulated size
    const sizes = ['120 Ko', '450 Ko', '780 Ko', '1.2 Mo', '2.5 Mo'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  isOrdonnance(filename: string): boolean {
    return filename.toLowerCase().includes('ordonnance') || 
           filename.toLowerCase().includes('prescription');
  }

  isAnalyse(filename: string): boolean {
    return filename.toLowerCase().includes('analyse') || 
           filename.toLowerCase().includes('bilan');
  }

  isRadiologie(filename: string): boolean {
    return filename.toLowerCase().includes('radio') || 
           filename.toLowerCase().includes('scanner') ||
           filename.toLowerCase().includes('irm');
  }

  isCertificat(filename: string): boolean {
    return filename.toLowerCase().includes('certificat') || 
           filename.toLowerCase().includes('aptitude');
  }

  getDocumentStats() {
    const documents = this.selectedDossier?.documentsMedicaux || [];
    
    return {
      ordonnances: documents.filter(d => this.isOrdonnance(d)).length,
      analyses: documents.filter(d => this.isAnalyse(d)).length,
      radiologies: documents.filter(d => this.isRadiologie(d)).length,
      certificats: documents.filter(d => this.isCertificat(d)).length,
      autres: documents.filter(d => 
        !this.isOrdonnance(d) && 
        !this.isAnalyse(d) && 
        !this.isRadiologie(d) && 
        !this.isCertificat(d)
      ).length
    };
  }

  // Consultation methods - Tri manuel sans pipe
  getSortedConsultations(consultations: Consultation[] | undefined): Consultation[] {
    if (!consultations) return [];
    
    // Créer une copie pour éviter la mutation
    return [...consultations].sort((a, b) => {
      const dateA = new Date(a.dateConsultation).getTime();
      const dateB = new Date(b.dateConsultation).getTime();
      return dateB - dateA; // Décroissant (plus récent d'abord)
    });
  }

  toggleConsultation(consultationId: number) {
    if (this.expandedConsultations.has(consultationId)) {
      this.expandedConsultations.delete(consultationId);
    } else {
      this.expandedConsultations.add(consultationId);
    }
  }

  addNewConsultation() {
    // Logic to add new consultation
    console.log('Opening new consultation form for patient:', this.selectedPatient?.idPatient);
  }

  // History methods
  getHistoryEvents() {
    return [
      {
        date: 'Aujourd\'hui',
        type: 'consultation',
        title: 'Consultation de contrôle',
        description: 'Contrôle semestriel de l\'hypertension',
        user: 'Dr. Bernard',
        time: '10:30'
      },
      {
        date: '15 Jan 2024',
        type: 'document',
        title: 'Document ajouté',
        description: 'Analyse sanguine du 10/01/2024',
        user: 'Assistante médicale',
        time: '14:15'
      },
      {
        date: '10 Jan 2024',
        type: 'modification',
        title: 'Dossier mis à jour',
        description: 'Ajout des antécédents familiaux',
        user: 'Dr. Bernard',
        time: '09:00'
      },
      {
        date: '15 Mar 2020',
        type: 'creation',
        title: 'Dossier créé',
        description: 'Première ouverture du dossier médical',
        user: 'Dr. Bernard',
        time: '11:30'
      }
    ];
  }

  // UI helper methods
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentDate(): Date {
    return new Date();
  }

  openNewDossierModal() {
    // Logic to open new dossier modal
    console.log('Opening new dossier modal');
  }

  viewPatientDetails(patient: Patient) {
    // Logic to view patient details
    console.log('Viewing details for patient:', patient.idPatient);
  }

  viewMedicalRecords(patient: Patient) {
    // Logic to view medical records
    this.selectPatient(patient);
  }

  openNewConsultation(patient: Patient) {
    // Logic to open new consultation
    this.selectPatient(patient);
    this.activeTab = 'consultations';
    console.log('Opening new consultation for patient:', patient.idPatient);
  }
}