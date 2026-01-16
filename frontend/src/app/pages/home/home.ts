import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  
  router = inject(Router);

  stats = {
    patients: 0,
    doctors: 0,
    specialties: 0,
    satisfaction: 0
  };

  finalStats = {
    patients: 1500,
    doctors: 25,
    specialties: 12,
    satisfaction: 98
  };

  features = [
    {
      icon: 'fas fa-clock',
      title: 'Rendez-vous Rapide',
      description: 'Prenez rendez-vous en quelques clics, sans attente au téléphone.'
    },
    {
      icon: 'fas fa-user-md',
      title: 'Médecins Experts',
      description: 'Une équipe de professionnels qualifiés et expérimentés à votre service.'
    },
    {
      icon: 'fas fa-laptop-medical',
      title: 'Technologie Avancée',
      description: 'Des équipements modernes pour des diagnostics précis et efficaces.'
    },
    {
      icon: 'fas fa-heart',
      title: 'Soins Personnalisés',
      description: 'Une approche humaine et personnalisée pour chaque patient.'
    }
  ];

  services = [
    {
      icon: 'fas fa-stethoscope',
      title: 'Consultations Générales',
      description: 'Bilan de santé complet et suivi médical régulier avec nos médecins généralistes.'
    },
    {
      icon: 'fas fa-procedures',
      title: 'Urgences Médicales',
      description: 'Prise en charge immédiate pour les situations médicales urgentes.'
    },
    {
      icon: 'fas fa-vial',
      title: 'Analyses Médicales',
      description: 'Laboratoire équipé pour tous types d\'analyses et de bilans sanguins.'
    },
    {
      icon: 'fas fa-x-ray',
      title: 'Imagerie Médicale',
      description: 'Radiologie, échographie et autres examens d\'imagerie de pointe.'
    },
    {
      icon: 'fas fa-brain',
      title: 'Spécialités Médicales',
      description: 'Accès à diverses spécialités : cardiologie, dermatologie, pédiatrie...'
    },
    {
      icon: 'fas fa-tablets',
      title: 'Pharmacie Intégrée',
      description: 'Service pharmaceutique sur place pour vos ordonnances et conseils.'
    }
  ];

  ngOnInit() {
    this.animateStats();
  }

  animateStats() {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(this.finalStats).forEach(stat => {
      this.animateNumber(
        this.stats,
        stat as keyof typeof this.stats,
        this.finalStats[stat as keyof typeof this.finalStats],
        steps,
        stepDuration
      );
    });
  }

  animateNumber(obj: any, key: string, finalValue: number, steps: number, stepDuration: number) {
    let currentStep = 0;
    const startValue = 0;
    const increment = finalValue / steps;

    const timer = setInterval(() => {
      currentStep++;
      obj[key] = Math.floor(increment * currentStep);

      if (currentStep >= steps) {
        obj[key] = finalValue;
        clearInterval(timer);
      }
    }, stepDuration);
  }

 takeAppointment() {
    this.router.navigate(['/RendRDV']);
  }

  learnMore() {
    console.log('En savoir plus...');
    // Implémentation "En savoir plus"
    // this.router.navigate(['/about']);
  }
}