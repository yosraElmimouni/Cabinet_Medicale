import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  datePrescription: Date;
  dateExpiration: Date;
  medecin: string;
  statut: 'en_cours' | 'terminee' | 'suspendue' | 'renouvelable';
  medicaments: Medicament[];
  instructions: string;
  observations: string;
  numero: string;
  type: 'normale' | 'renouvellement' | 'urgence' | 'chronique';
}

interface Medicament {
  id: number;
  nom: string;
  dci: string;
  dosage: string;
  forme: 'comprime' | 'sirop' | 'injection' | 'gel' | 'pommade' | 'autre';
  quantite: number;
  posologie: string;
  duree: number;
  renouvelable: boolean;
  renouvellements: number;
  remarques: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  dossierId: number;
}

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './prescriptions.html',
  styleUrls: ['./prescriptions.scss']
})
export class PrescriptionsComponent implements OnInit {
  // Filtres
  searchQuery: string = '';
  filterStatut: string = 'all';
  filterType: string = 'all';
  sortBy: string = 'date_desc';
  
  // Données
  prescriptions: Prescription[] = [];
  patients: Patient[] = [];
  
  // Modal
  showPrescriptionModal: boolean = false;
  selectedPrescription: Prescription | null = null;
  isEditing: boolean = false;
  prescriptionForm!: FormGroup;
  
  // Médicaments disponibles
  medicamentsDisponibles = [
    { dci: 'Paracétamol', nom: 'Doliprane', formes: ['comprimé', 'sirop'] },
    { dci: 'Ibuprofène', nom: 'Advil', formes: ['comprimé', 'gel'] },
    { dci: 'Amoxicilline', nom: 'Clamoxyl', formes: ['comprimé', 'sirop'] },
    { dci: 'Amlodipine', nom: 'Amlor', formes: ['comprimé'] },
    { dci: 'Atorvastatine', nom: 'Tahor', formes: ['comprimé'] },
    { dci: 'Metformine', nom: 'Glucophage', formes: ['comprimé'] },
    { dci: 'Salbutamol', nom: 'Ventoline', formes: ['aérosol'] },
    { dci: 'Oméprazole', nom: 'Mopral', formes: ['comprimé', 'gélule'] }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeData();
    this.initForm();
  }

  initializeData() {
    // Patients de démo
    this.patients = [
      { id: 1, name: 'Jean Martin', age: 45, gender: 'Homme', avatar: '👨‍🦰', dossierId: 101 },
      { id: 2, name: 'Marie Curie', age: 32, gender: 'Femme', avatar: '👩‍⚕️', dossierId: 102 },
      { id: 3, name: 'Paul Durand', age: 68, gender: 'Homme', avatar: '👨‍🦳', dossierId: 103 },
      { id: 4, name: 'Sophie Bernard', age: 29, gender: 'Femme', avatar: '👩', dossierId: 104 },
      { id: 5, name: 'Robert Lefevre', age: 55, gender: 'Homme', avatar: '👨', dossierId: 105 },
      { id: 6, name: 'Camille Dubois', age: 40, gender: 'Femme', avatar: '👩‍💼', dossierId: 106 }
    ];

    // Prescriptions de démo
    this.prescriptions = [
      {
        id: 1,
        patientId: 1,
        patientName: 'Jean Martin',
        datePrescription: new Date('2024-03-15'),
        dateExpiration: new Date('2024-06-15'),
        medecin: 'Dr. Sophie Bernard',
        statut: 'en_cours',
        numero: 'RX-2024-001',
        type: 'chronique',
        instructions: 'Prendre les médicaments pendant les repas. Éviter l\'alcool.',
        observations: 'Patient observant. Contrôle tensionnel mensuel requis.',
        medicaments: [
          {
            id: 1,
            nom: 'Amlor',
            dci: 'Amlodipine',
            dosage: '5mg',
            forme: 'comprime',
            quantite: 30,
            posologie: '1 comprimé par jour le matin',
            duree: 30,
            renouvelable: true,
            renouvellements: 3,
            remarques: 'Surveiller la tension artérielle'
          },
          {
            id: 2,
            nom: 'Tahor',
            dci: 'Atorvastatine',
            dosage: '20mg',
            forme: 'comprime',
            quantite: 30,
            posologie: '1 comprimé le soir au coucher',
            duree: 30,
            renouvelable: true,
            renouvellements: 3,
            remarques: 'Bilan lipidique dans 3 mois'
          }
        ]
      },
      {
        id: 2,
        patientId: 2,
        patientName: 'Marie Curie',
        datePrescription: new Date('2024-03-10'),
        dateExpiration: new Date('2024-04-10'),
        medecin: 'Dr. Paul Durand',
        statut: 'en_cours',
        numero: 'RX-2024-002',
        type: 'normale',
        instructions: 'Prendre avant les repas. Compléter le traitement.',
        observations: 'Asthme modéré bien contrôlé',
        medicaments: [
          {
            id: 3,
            nom: 'Ventoline',
            dci: 'Salbutamol',
            dosage: '100µg/dose',
            forme: 'injection',
            quantite: 1,
            posologie: '1 à 2 bouffées en cas de besoin',
            duree: 0,
            renouvelable: false,
            renouvellements: 0,
            remarques: 'À conserver à température ambiante'
          }
        ]
      },
      {
        id: 3,
        patientId: 3,
        patientName: 'Paul Durand',
        datePrescription: new Date('2024-03-05'),
        dateExpiration: new Date('2024-05-05'),
        medecin: 'Dr. Sophie Bernard',
        statut: 'terminee',
        numero: 'RX-2024-003',
        type: 'chronique',
        instructions: 'Prise matin et soir. Surveiller glycémie.',
        observations: 'Diabète type 2 équilibré',
        medicaments: [
          {
            id: 4,
            nom: 'Glucophage',
            dci: 'Metformine',
            dosage: '850mg',
            forme: 'comprime',
            quantite: 60,
            posologie: '1 comprimé matin et soir',
            duree: 30,
            renouvelable: true,
            renouvellements: 2,
            remarques: 'À prendre avec les repas'
          }
        ]
      },
      {
        id: 4,
        patientId: 4,
        patientName: 'Sophie Bernard',
        datePrescription: new Date('2024-03-18'),
        dateExpiration: new Date('2024-03-25'),
        medecin: 'Dr. Jean Martin',
        statut: 'suspendue',
        numero: 'RX-2024-004',
        type: 'urgence',
        instructions: 'Antibiothérapie à compléter. Boire beaucoup d\'eau.',
        observations: 'Sinusite aiguë',
        medicaments: [
          {
            id: 5,
            nom: 'Clamoxyl',
            dci: 'Amoxicilline',
            dosage: '1g',
            forme: 'comprime',
            quantite: 12,
            posologie: '1 comprimé toutes les 12 heures',
            duree: 6,
            renouvelable: false,
            renouvellements: 0,
            remarques: 'Peut causer des troubles digestifs'
          }
        ]
      }
    ];
  }

  initForm() {
    this.prescriptionForm = this.fb.group({
      patientId: ['', Validators.required],
      type: ['normale', Validators.required],
      instructions: [''],
      observations: [''],
      medicaments: this.fb.array([])
    });
  }

  // Getters pour FormArrays
  get medicaments(): FormArray {
    return this.prescriptionForm.get('medicaments') as FormArray;
  }

  // Méthodes pour les médicaments
  addMedicament() {
    const medicamentGroup = this.fb.group({
      nom: ['', Validators.required],
      dci: ['', Validators.required],
      dosage: ['', Validators.required],
      forme: ['comprime', Validators.required],
      quantite: ['', [Validators.required, Validators.min(1)]],
      posologie: ['', Validators.required],
      duree: ['', [Validators.required, Validators.min(1)]],
      renouvelable: [false],
      renouvellements: [0],
      remarques: ['']
    });
    
    this.medicaments.push(medicamentGroup);
  }

  removeMedicament(index: number) {
    this.medicaments.removeAt(index);
  }

  // Filtrage et recherche
  getFilteredPrescriptions(): Prescription[] {
    let filtered = [...this.prescriptions];

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(prescription =>
        prescription.patientName.toLowerCase().includes(query) ||
        prescription.numero.toLowerCase().includes(query) ||
        prescription.medecin.toLowerCase().includes(query) ||
        prescription.medicaments.some(m => 
          m.nom.toLowerCase().includes(query) || 
          m.dci.toLowerCase().includes(query)
        )
      );
    }

    // Filtre par statut
    if (this.filterStatut !== 'all') {
      filtered = filtered.filter(prescription => prescription.statut === this.filterStatut);
    }

    // Filtre par type
    if (this.filterType !== 'all') {
      filtered = filtered.filter(prescription => prescription.type === this.filterType);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date_desc':
          return new Date(b.datePrescription).getTime() - new Date(a.datePrescription).getTime();
        case 'date_asc':
          return new Date(a.datePrescription).getTime() - new Date(b.datePrescription).getTime();
        case 'patient':
          return a.patientName.localeCompare(b.patientName);
        case 'expiration':
          return new Date(a.dateExpiration).getTime() - new Date(b.dateExpiration).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }

  // Statistiques
  getTotalPrescriptions(): number {
    return this.prescriptions.length;
  }

  getActivePrescriptions(): number {
    return this.prescriptions.filter(p => p.statut === 'en_cours').length;
  }

  getExpiringSoon(): number {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return this.prescriptions.filter(p => 
      p.statut === 'en_cours' && 
      new Date(p.dateExpiration) <= nextWeek
    ).length;
  }

  getRenewablePrescriptions(): number {
    return this.prescriptions.filter(p => 
      p.statut === 'en_cours' && 
      p.medicaments.some(m => m.renouvelable && m.renouvellements > 0)
    ).length;
  }

  // Méthodes utilitaires
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'suspendue': 'Suspendue',
      'renouvelable': 'Renouvelable'
    };
    return labels[statut] || statut;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'normale': 'Normale',
      'renouvellement': 'Renouvellement',
      'urgence': 'Urgence',
      'chronique': 'Chronique'
    };
    return labels[type] || type;
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en_cours': '#10B981',
      'terminee': '#6B7280',
      'suspendue': '#F59E0B',
      'renouvelable': '#3B82F6'
    };
    return colors[statut] || '#3B82F6';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'normale': '#3B82F6',
      'renouvellement': '#8B5CF6',
      'urgence': '#EF4444',
      'chronique': '#10B981'
    };
    return colors[type] || '#6B7280';
  }

  getFormeIcon(forme: string): string {
    const icons: { [key: string]: string } = {
      'comprime': 'fa-tablet-alt',
      'sirop': 'fa-wine-bottle',
      'injection': 'fa-syringe',
      'gel': 'fa-tint',
      'pommade': 'fa-prescription-bottle',
      'autre': 'fa-pills'
    };
    return icons[forme] || 'fa-pills';
  }

  isExpiringSoon(date: Date): boolean {
    const today = new Date();
    const expirationDate = new Date(date);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }

  isExpired(date: Date): boolean {
    return new Date(date) < new Date();
  }

  // Gestion des prescriptions
  viewPrescription(prescription: Prescription) {
    this.selectedPrescription = prescription;
    this.isEditing = false;
    this.showPrescriptionModal = true;
    this.patchForm(prescription);
  }

  editPrescription(prescription: Prescription) {
    this.selectedPrescription = prescription;
    this.isEditing = true;
    this.showPrescriptionModal = true;
    this.patchForm(prescription);
  }

  newPrescription() {
    this.selectedPrescription = null;
    this.isEditing = false;
    this.showPrescriptionModal = true;
    this.prescriptionForm.reset({
      type: 'normale',
      medicaments: []
    });
  }

  patchForm(prescription: Prescription) {
    this.prescriptionForm.patchValue({
      patientId: prescription.patientId,
      type: prescription.type,
      instructions: prescription.instructions,
      observations: prescription.observations
    });

    // Vider et remplir les médicaments
    this.medicaments.clear();
    prescription.medicaments.forEach(medicament => {
      this.medicaments.push(this.fb.group({
        nom: [medicament.nom],
        dci: [medicament.dci],
        dosage: [medicament.dosage],
        forme: [medicament.forme],
        quantite: [medicament.quantite],
        posologie: [medicament.posologie],
        duree: [medicament.duree],
        renouvelable: [medicament.renouvelable],
        renouvellements: [medicament.renouvellements],
        remarques: [medicament.remarques]
      }));
    });
  }

  savePrescription() {
    if (this.prescriptionForm.valid) {
      const formValue = this.prescriptionForm.value;
      const now = new Date();
      const expiration = new Date(now);
      expiration.setMonth(expiration.getMonth() + 3);

      const nouvellePrescription: Prescription = {
        id: this.isEditing && this.selectedPrescription ? this.selectedPrescription.id : Math.max(...this.prescriptions.map(p => p.id), 0) + 1,
        patientId: formValue.patientId,
        patientName: this.patients.find(p => p.id === formValue.patientId)?.name || 'Patient',
        datePrescription: now,
        dateExpiration: expiration,
        medecin: 'Dr. Actuel',
        statut: 'en_cours',
        numero: `RX-${now.getFullYear()}-${String(this.prescriptions.length + 1).padStart(3, '0')}`,
        type: formValue.type,
        instructions: formValue.instructions,
        observations: formValue.observations,
        medicaments: formValue.medicaments
      };

      if (this.isEditing && this.selectedPrescription) {
        const index = this.prescriptions.findIndex(p => p.id === this.selectedPrescription!.id);
        if (index !== -1) {
          this.prescriptions[index] = nouvellePrescription;
        }
      } else {
        this.prescriptions.unshift(nouvellePrescription);
      }

      this.closeModal();
    }
  }

  deletePrescription(id: number) {
    this.prescriptions = this.prescriptions.filter(p => p.id !== id);
    this.closeModal();
  }

  renewPrescription(prescription: Prescription) {
    const renewedPrescription: Prescription = {
      ...prescription,
      id: Math.max(...this.prescriptions.map(p => p.id), 0) + 1,
      datePrescription: new Date(),
      dateExpiration: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      numero: `RX-${new Date().getFullYear()}-${String(this.prescriptions.length + 1).padStart(3, '0')}`,
      medicaments: prescription.medicaments.map(m => ({
        ...m,
        renouvellements: m.renouvellements > 0 ? m.renouvellements - 1 : 0
      }))
    };
    
    this.prescriptions.unshift(renewedPrescription);
  }

  suspendPrescription(id: number) {
    const prescription = this.prescriptions.find(p => p.id === id);
    if (prescription) {
      prescription.statut = 'suspendue';
    }
  }

  // Modal
  closeModal() {
    this.showPrescriptionModal = false;
    this.selectedPrescription = null;
    this.prescriptionForm.reset();
    this.medicaments.clear();
  }

  // Impression
  printPrescription(prescription: Prescription) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription ${prescription.numero}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .patient-info { margin-bottom: 30px; }
              .medicaments { margin-bottom: 30px; }
              .signature { margin-top: 50px; text-align: right; }
              .footer { margin-top: 50px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>ORDONNANCE MÉDICALE</h2>
              <p>Numéro: ${prescription.numero}</p>
            </div>
            <div class="patient-info">
              <h3>Patient: ${prescription.patientName}</h3>
              <p>Date: ${prescription.datePrescription.toLocaleDateString()}</p>
              <p>Médecin: ${prescription.medecin}</p>
            </div>
            <div class="medicaments">
              <h3>MÉDICAMENTS PRESCRITS:</h3>
              ${prescription.medicaments.map(m => `
                <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #000;">
                  <p><strong>${m.nom} (${m.dci})</strong> - ${m.dosage}</p>
                  <p>${m.quantite} ${m.forme} - ${m.posologie}</p>
                  <p>Durée: ${m.duree} jours - Renouvellements: ${m.renouvellements}</p>
                  <p><em>${m.remarques}</em></p>
                </div>
              `).join('')}
            </div>
            <div class="instructions">
              <h3>INSTRUCTIONS:</h3>
              <p>${prescription.instructions}</p>
            </div>
            <div class="signature">
              <p>Signature et cachet:</p>
              <p style="margin-top: 50px;">_________________________</p>
              <p>${prescription.medecin}</p>
            </div>
            <div class="footer">
              <p>Ordonnance valide jusqu'au: ${prescription.dateExpiration.toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
