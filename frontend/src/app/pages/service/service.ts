import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service.html',
  styleUrl: './service.scss',
})
export class Service implements OnInit {
  constructor(private router: Router) {}
  // États
  activeCategory = 'all';
  activeFaq: string | null = null;
  searchQuery = '';

  // Services flottants pour l'animation
  floatingServices = [
    { icon: 'fas fa-heartbeat', delay: '0s', duration: '6s' },
    { icon: 'fas fa-stethoscope', delay: '1s', duration: '7s' },
    { icon: 'fas fa-pills', delay: '2s', duration: '8s' },
    { icon: 'fas fa-syringe', delay: '3s', duration: '9s' },
    { icon: 'fas fa-x-ray', delay: '4s', duration: '10s' },
    { icon: 'fas fa-procedures', delay: '5s', duration: '11s' }
  ];

  // Catégories
  categories = [
    { id: 'all', name: 'Tous les services', icon: 'fas fa-th-large' },
    { id: 'consultation', name: 'Consultations', icon: 'fas fa-user-md' },
    { id: 'diagnostic', name: 'Diagnostics', icon: 'fas fa-search' },
    { id: 'treatment', name: 'Traitements', icon: 'fas fa-pills' },
    { id: 'surgery', name: 'Chirurgie', icon: 'fas fa-scalpel' },
    { id: 'prevention', name: 'Prévention', icon: 'fas fa-shield-alt' },
    { id: 'emergency', name: 'Urgences', icon: 'fas fa-ambulance' }
  ];

  // Services
  services = [
    {
      id: 'general-consultation',
      name: 'Consultation Générale',
      category: 'consultation',
      icon: 'fas fa-user-md',
      description: 'Bilan de santé complet avec un médecin généraliste pour un suivi médical personnalisé.',
      duration: '30 min',
      price: '50€',
      featured: true,
      urgent: false,
      features: [
        'Examen physique complet',
        'Analyse des symptômes',
        'Prescription si nécessaire',
        'Conseils de prévention'
      ],
      doctors: 8,
      availability: 'Aujourd\'hui',
      rating: 4.8
    },
    {
      id: 'cardiology',
      name: 'Consultation Cardiologie',
      category: 'consultation',
      icon: 'fas fa-heart',
      description: 'Examen spécialisé du cœur et des vaisseaux avec un cardiologue expérimenté.',
      duration: '45 min',
      price: '80€',
      featured: false,
      urgent: true,
      features: [
        'Électrocardiogramme',
        'Échocardiographie',
        'Bilan cardiaque complet',
        'Suivi personnalisé'
      ],
      doctors: 3,
      availability: 'Demain',
      rating: 4.9
    },
    {
      id: 'mri-scan',
      name: 'IRM Médicale',
      category: 'diagnostic',
      icon: 'fas fa-magnet',
      description: 'Imagerie par résonance magnétique de haute précision pour un diagnostic avancé.',
      duration: '60 min',
      price: '250€',
      featured: true,
      urgent: false,
      features: [
        'Technologie 3 Tesla',
        'Résolution haute définition',
        'Radiologue expert',
        'Résultats sous 24h'
      ],
      doctors: 2,
      availability: 'Cette semaine',
      rating: 4.7
    },
    {
      id: 'blood-test',
      name: 'Analyses Sanguines',
      category: 'diagnostic',
      icon: 'fas fa-vial',
      description: 'Bilan sanguin complet avec analyse en laboratoire et interprétation médicale.',
      duration: '15 min',
      price: '35€',
      featured: false,
      urgent: true,
      features: [
        'Prélèvement indolore',
        'Résultats rapides',
        'Bilan complet',
        'Interprétation médicale'
      ],
      doctors: 5,
      availability: 'Aujourd\'hui',
      rating: 4.6
    },
    {
      id: 'physiotherapy',
      name: 'Kinésithérapie',
      category: 'treatment',
      icon: 'fas fa-hand-holding-heart',
      description: 'Rééducation fonctionnelle et traitement des troubles musculo-squelettiques.',
      duration: '45 min',
      price: '45€',
      featured: false,
      urgent: false,
      features: [
        'Bilan personnalisé',
        'Exercices adaptés',
        'Massages thérapeutiques',
        'Suivi régulier'
      ],
      doctors: 4,
      availability: 'Demain',
      rating: 4.8
    },
    {
      id: 'vaccination',
      name: 'Centre de Vaccination',
      category: 'prevention',
      icon: 'fas fa-syringe',
      description: 'Vaccinations internationales et vaccins de routine dans un cadre sécurisé.',
      duration: '20 min',
      price: '25€',
      featured: true,
      urgent: false,
      features: [
        'Vaccins internationaux',
        'Carnet de vaccination',
        'Conseils voyage',
        'Suivi rappel'
      ],
      doctors: 3,
      availability: 'Aujourd\'hui',
      rating: 4.9
    }
  ];

  // Services en vedette
  featuredServices = [
    {
      id: 'telemedicine',
      name: 'Téléconsultation',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: 'fas fa-video',
      shortDescription: 'Consultation médicale à distance avec nos spécialistes.',
      successRate: '98%',
      patients: '5000+'
    },
    {
      id: 'checkup',
      name: 'Bilan de Santé Complet',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: 'fas fa-clipboard-check',
      shortDescription: 'Examen médical approfondi pour une prévention optimale.',
      successRate: '95%',
      patients: '3000+'
    },
    {
      id: 'surgery',
      name: 'Chirurgie Ambulatoire',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: 'fas fa-procedures',
      shortDescription: 'Interventions chirurgicales sans hospitalisation.',
      successRate: '99%',
      patients: '2000+'
    }
  ];

  // Processus
  processSteps = [
    {
      icon: 'fas fa-calendar-check',
      title: 'Prise de Rendez-vous',
      description: 'Choisissez la date et l\'horaire qui vous conviennent en ligne ou par téléphone.',
      duration: '5 min'
    },
    {
      icon: 'fas fa-file-medical',
      title: 'Consultation',
      description: 'Rencontrez votre médecin pour un examen complet et personnalisé.',
      duration: '30-60 min'
    },
    {
      icon: 'fas fa-search',
      title: 'Diagnostic',
      description: 'Bilan approfondi avec examens complémentaires si nécessaire.',
      duration: '24-48h'
    },
    {
      icon: 'fas fa-pills',
      title: 'Traitement',
      description: 'Mise en place du plan de traitement adapté à votre situation.',
      duration: 'Variable'
    },
    {
      icon: 'fas fa-user-check',
      title: 'Suivi',
      description: 'Accompagnement continu pour assurer votre rétablissement.',
      duration: 'Continue'
    }
  ];

  // FAQ
  faqs = [
    {
      id: 'faq1',
      question: 'Comment prendre rendez-vous ?',
      answer: 'Vous pouvez prendre rendez-vous en ligne via notre plateforme, par téléphone au 01 23 45 67 89, ou directement à l\'accueil de notre cabinet.'
    },
    {
      id: 'faq2',
      question: 'Les consultations sont-elles remboursées ?',
      answer: 'Oui, la plupart de nos consultations sont remboursées par la Sécurité Sociale et les mutuelles. Nous sommes conventionnés secteur 1.'
    },
    {
      id: 'faq3',
      question: 'Quels documents apporter ?',
      answer: 'Pensez à apporter votre carte vitale, pièce d\'identité, ordonnances récentes et résultats d\'examens antérieurs.'
    },
    {
      id: 'faq4',
      question: 'Proposez-vous des urgences ?',
      answer: 'Oui, nous avons un service d\'urgences médicales ouvert 24h/24. En cas d\'urgence vitale, composez le 15.'
    }
  ];

  ngOnInit() {
    // Initialisation
  }

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
  }

  getActiveCategoryName(): string {
    const category = this.categories.find(c => c.id === this.activeCategory);
    return category ? category.name : 'Tous les services';
  }

  getFilteredServices() {
    if (this.activeCategory === 'all') {
      return this.services;
    }
    return this.services.filter(service => service.category === this.activeCategory);
  }

  getFeaturedServices() {
    // Retourne les services définis explicitement comme "featuredServices"
    // Ces objets contiennent des propriétés additionnelles comme `successRate` et `patients`.
    return this.featuredServices;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  viewServiceDetails(serviceId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('Voir les détails du service:', serviceId);
    // Navigation vers la page de détails du service
  }

  bookService(serviceId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('Prendre RDV pour le service:', serviceId);
    // Navigation vers la page de prise de RDV
  }

  toggleFaq(faqId: string) {
    this.activeFaq = this.activeFaq === faqId ? null : faqId;
  }

  goToAppointment() {
    this.router.navigate(['/RendRDV']);
  }
  
}
