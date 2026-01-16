import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medecins.html',
  styleUrl: './medecins.scss',
})
export class Medecins implements OnInit {
  
  // États
  searchQuery = '';
  showFilters = false;
  availabilityFilter = '';
  selectedSpecialties: string[] = [];
  selectedLanguages: string[] = [];
  hasMoreDoctors = true;

  // Particules pour l'animation
  particles = Array(12).fill(0);

  // Spécialités
  specialties = [
    {
      id: 'general',
      name: 'Médecine Générale',
      icon: 'fas fa-user-md',
      description: 'Consultation et suivi médical général',
      doctorCount: 8
    },
    {
      id: 'cardio',
      name: 'Cardiologie',
      icon: 'fas fa-heart',
      description: 'Spécialiste du cœur et des vaisseaux',
      doctorCount: 3
    },
    {
      id: 'dermato',
      name: 'Dermatologie',
      icon: 'fas fa-allergies',
      description: 'Soins de la peau et des cheveux',
      doctorCount: 2
    },
    {
      id: 'pediatrie',
      name: 'Pédiatrie',
      icon: 'fas fa-baby',
      description: 'Médecine pour enfants et adolescents',
      doctorCount: 4
    },
    {
      id: 'gyneco',
      name: 'Gynécologie',
      icon: 'fas fa-female',
      description: 'Santé féminine et suivi gynécologique',
      doctorCount: 3
    },
    {
      id: 'ophtalmo',
      name: 'Ophtalmologie',
      icon: 'fas fa-eye',
      description: 'Soins des yeux et de la vision',
      doctorCount: 2
    }
  ];

  // Langues
  languages = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand'];

  // Médecins
  doctors = [
    {
      id: 'martin',
      name: 'Martin',
      specialty: 'Médecine Générale',
      avatar: '/assets/doctors/doctor1.jpg',
      rating: 5,
      reviews: 127,
      experience: '15 ans d\'expérience',
      online: true,
      featured: true,
      favorite: false,
      skills: ['Diagnostic', 'Prévention', 'Suivi médical', 'Vaccination'],
      availability: ['Aujourd\'hui 14:00', 'Demain 09:00', 'Demain 16:30'],
      languages: ['Français', 'Anglais']
    },
    {
      id: 'bernard',
      name: 'Bernard',
      specialty: 'Cardiologie',
      avatar: '/assets/doctors/doctor2.jpg',
      rating: 4,
      reviews: 89,
      experience: '12 ans d\'expérience',
      online: false,
      featured: false,
      favorite: true,
      skills: ['Échocardiographie', 'Holter', 'Stress test', 'Rythmologie'],
      availability: ['Demain 10:00', 'Jeudi 14:30', 'Vendredi 11:00'],
      languages: ['Français', 'Arabe']
    },
    {
      id: 'dubois',
      name: 'Dubois',
      specialty: 'Dermatologie',
      avatar: '/assets/doctors/doctor3.jpg',
      rating: 5,
      reviews: 203,
      experience: '18 ans d\'expérience',
      online: true,
      featured: true,
      favorite: false,
      skills: ['Dermatoscopie', 'Cryothérapie', 'Biopsie', 'Laser'],
      availability: ['Aujourd\'hui 16:00', 'Mercredi 09:30', 'Vendredi 14:00'],
      languages: ['Français', 'Anglais', 'Espagnol']
    },
    {
      id: 'moreau',
      name: 'Moreau',
      specialty: 'Pédiatrie',
      avatar: '/assets/doctors/doctor4.jpg',
      rating: 4,
      reviews: 156,
      experience: '10 ans d\'expérience',
      online: true,
      featured: false,
      favorite: false,
      skills: ['Vaccination', 'Croissance', 'Nutrition', 'Développement'],
      availability: ['Aujourd\'hui 15:00', 'Jeudi 10:30', 'Samedi 09:00'],
      languages: ['Français', 'Anglais']
    }
  ];

  // Témoignages
  testimonials = [
    {
      text: 'Le Dr. Martin est exceptionnel. Très à l\'écoute et professionnel. Je le recommande vivement !',
      author: 'Marie Lambert',
      avatar: '/assets/patients/patient1.jpg',
      doctor: 'Martin'
    },
    {
      text: 'Consultation avec le Dr. Dubois pour un problème de peau. Résultats impressionnants et suivi impeccable.',
      author: 'Pierre Durand',
      avatar: '/assets/patients/patient2.jpg',
      doctor: 'Dubois'
    },
    {
      text: 'Le Dr. Bernard a su diagnostiquer mon problème cardiaque rapidement. Un vrai professionnel !',
      author: 'Sophie Martin',
      avatar: '/assets/patients/patient3.jpg',
      doctor: 'Bernard'
    }
  ];

  ngOnInit() {
    // Initialisation
  }

  get filteredDoctors() {
    return this.doctors.filter(doctor => {
      // Filtre par recherche
      const matchesSearch = !this.searchQuery || 
        doctor.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtre par spécialités
      const matchesSpecialty = this.selectedSpecialties.length === 0 || 
        this.selectedSpecialties.includes(this.getSpecialtyId(doctor.specialty));

      // Filtre par langues
      const matchesLanguage = this.selectedLanguages.length === 0 ||
        this.selectedLanguages.some(lang => doctor.languages.includes(lang));

      return matchesSearch && matchesSpecialty && matchesLanguage;
    });
  }

  getSpecialtyId(specialtyName: string): string {
    const specialty = this.specialties.find(s => s.name === specialtyName);
    return specialty ? specialty.id : '';
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleSpecialty(specialtyId: string) {
    const index = this.selectedSpecialties.indexOf(specialtyId);
    if (index > -1) {
      this.selectedSpecialties.splice(index, 1);
    } else {
      this.selectedSpecialties.push(specialtyId);
    }
    this.filterDoctors();
  }

  toggleLanguage(language: string) {
    const index = this.selectedLanguages.indexOf(language);
    if (index > -1) {
      this.selectedLanguages.splice(index, 1);
    } else {
      this.selectedLanguages.push(language);
    }
    this.filterDoctors();
  }

  setAvailability(availability: string) {
    this.availabilityFilter = availability;
    // Implémenter la logique de filtrage par disponibilité
  }

  filterDoctors() {
    // Le filtrage est géré par le getter filteredDoctors
  }

  filterBySpecialty(specialtyId: string) {
    this.selectedSpecialties = [specialtyId];
    this.showFilters = false;
  }

  viewDoctorProfile(doctorId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('Voir le profil du médecin:', doctorId);
    // Navigation vers la page du profil du médecin
  }

  bookAppointment(doctorId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('Prendre RDV avec le médecin:', doctorId);
    // Navigation vers la page de prise de RDV
  }

  toggleFavorite(doctorId: string, event: Event) {
    event.stopPropagation();
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      doctor.favorite = !doctor.favorite;
    }
  }

  loadMoreDoctors() {
    // Logique pour charger plus de médecins
    console.log('Chargement de médecins supplémentaires...');
    this.hasMoreDoctors = false; // À adapter selon la logique de pagination
  }
}