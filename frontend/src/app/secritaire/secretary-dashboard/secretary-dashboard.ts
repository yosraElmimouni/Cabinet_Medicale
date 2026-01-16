import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderSec } from '../header-sec/header-sec';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './secretary-dashboard.html',
  styleUrl: './secretary-dashboard.scss'
})
export class SecretaryDashboard implements OnInit {
  // Données de la secrétaire
  secretaryName = 'Marie Dupont';
  currentTime = new Date();
  
  // Statistiques
  stats = [
    { 
      type: 'appointments', 
      icon: 'fas fa-calendar-check', 
      value: '12', 
      label: 'RDV Aujourd\'hui', 
      trend: 8 
    },
    { 
      type: 'patients', 
      icon: 'fas fa-user-injured', 
      value: '5', 
      label: 'Nouveaux Patients', 
      trend: 15 
    },
    { 
      type: 'revenue', 
      icon: 'fas fa-euro-sign', 
      value: '1,240€', 
      label: 'Chiffre d\'Affaires', 
      trend: 12 
    },
    { 
      type: 'waiting', 
      icon: 'fas fa-clock', 
      value: '3', 
      label: 'En Attente', 
      trend: -5 
    }
  ];

  // Méthodes utilitaires
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialisation au chargement du composant
  }

  quickAppointment(): void {
    console.log('Création d\'un nouveau rendez-vous');
    this.router.navigate(['/RendRDV']);
  }

  quickPatient(): void {
    console.log('Création d\'un nouveau patient');
    // Navigation ou ouverture d'un formulaire d'ajout de patient
  }
}
