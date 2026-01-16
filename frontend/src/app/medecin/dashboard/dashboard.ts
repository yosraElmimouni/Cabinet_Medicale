import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  doctorName: string = 'Dr. Martin Dupont';
  currentTime: Date = new Date();
  currentDateString: string = '';
  Math = Math; // Pour utiliser Math.abs dans le template

  // Tableaux pour les traductions françaises
  private daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  private monthsFr = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  stats = [
    { 
      type: 'appointments', 
      icon: 'fas fa-calendar-check', 
      value: '18', 
      label: 'RDV Aujourd\'hui',
      trend: 12 
    },
    { 
      type: 'patients', 
      icon: 'fas fa-user-injured', 
      value: '6', 
      label: 'Patients en Attente',
      trend: 5 
    },
    { 
      type: 'revenue', 
      icon: 'fas fa-euro-sign', 
      value: '€1,240', 
      label: 'Revenu Journalier',
      trend: 8 
    },
    { 
      type: 'consultations', 
      icon: 'fas fa-stethoscope', 
      value: '32', 
      label: 'Consultations/Mois',
      trend: 15 
    }
  ];

  appointments = [
    { 
      patient: 'Jean Martin', 
      time: '09:00', 
      type: 'Consultation', 
      status: 'confirmed',
      avatar: '👨‍🦰'
    },
    { 
      patient: 'Marie Curie', 
      time: '10:30', 
      type: 'Suivi', 
      status: 'confirmed',
      avatar: '👩‍⚕️'
    },
    { 
      patient: 'Paul Durand', 
      time: '11:15', 
      type: 'Urgence', 
      status: 'emergency',
      avatar: '👨‍🦳'
    },
    { 
      patient: 'Sophie Bernard', 
      time: '14:00', 
      type: 'Consultation', 
      status: 'confirmed',
      avatar: '👩'
    }
  ];



  ngOnInit() {
    // Initialiser la date
    this.updateDateString();
    
    // Mettre à jour l'heure et la date en temps réel
    setInterval(() => {
      this.currentTime = new Date();
      this.updateDateString();
    }, 60000); // Toutes les minutes
  }

  private updateDateString() {
    const now = new Date();
    const dayName = this.daysFr[now.getDay()];
    const dayNumber = now.getDate();
    const monthName = this.monthsFr[now.getMonth()];
    const year = now.getFullYear();
    
    // Format: "Lundi 15 mars 2024"
    this.currentDateString = `${dayName} ${dayNumber} ${monthName} ${year}`;
  }

  quickAppointment() {
    console.log('Nouveau RDV');
    // Logique pour créer un nouveau rendez-vous
  }

  quickPatient() {
    console.log('Nouveau Patient');
    // Logique pour ajouter un nouveau patient
  }

  startConsultation(patientName: string) {
    console.log('Démarrer consultation pour:', patientName);
    // Logique de démarrage de consultation
  }

  viewPatientHistory(patientName: string) {
    console.log('Voir historique de:', patientName);
    // Logique pour voir l'historique patient
  }
}