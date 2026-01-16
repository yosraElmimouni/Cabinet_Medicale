import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rend-rdv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rend-rdv.html',
  styleUrl: './rend-rdv.scss',
})
export class RendRDV {
  currentStep = 1;
  selectedSpecialty: string = '';
  selectedDoctor: string = '';
  selectedDate: string = '';
  selectedTime: string = '';

  // Données des spécialités
  specialties = [
    {
      id: 'general',
      name: 'Médecine Générale',
      icon: 'fas fa-user-md',
      description: 'Consultation et suivi médical général',
      availability: 'Disponible aujourd\'hui'
    },
    {
      id: 'cardio',
      name: 'Cardiologie',
      icon: 'fas fa-heart',
      description: 'Spécialiste du cœur et des vaisseaux',
      availability: 'Disponible demain'
    },
    {
      id: 'dermato',
      name: 'Dermatologie',
      icon: 'fas fa-allergies',
      description: 'Soins de la peau et des cheveux',
      availability: 'Disponible cette semaine'
    },
    {
      id: 'pediatrie',
      name: 'Pédiatrie',
      icon: 'fas fa-baby',
      description: 'Médecine pour enfants et adolescents',
      availability: 'Disponible aujourd\'hui'
    },
    {
      id: 'gyneco',
      name: 'Gynécologie',
      icon: 'fas fa-female',
      description: 'Santé féminine et suivi gynécologique',
      availability: 'Disponible demain'
    },
    {
      id: 'ophtalmo',
      name: 'Ophtalmologie',
      icon: 'fas fa-eye',
      description: 'Soins des yeux et de la vision',
      availability: 'Disponible cette semaine'
    }
  ];

  // Données des médecins
  doctors = [
    {
      id: 'martin',
      name: 'Martin',
      specialty: 'Médecine Générale',
      avatar: '/assets/doctors/doctor1.jpg',
      rating: 5,
      reviews: 127,
      experience: '15 ans d\'expérience',
      online: true
    },
    {
      id: 'bernard',
      name: 'Bernard',
      specialty: 'Cardiologie',
      avatar: '/assets/doctors/doctor2.jpg',
      rating: 4,
      reviews: 89,
      experience: '12 ans d\'expérience',
      online: false
    },
    {
      id: 'dubois',
      name: 'Dubois',
      specialty: 'Dermatologie',
      avatar: '/assets/doctors/doctor3.jpg',
      rating: 5,
      reviews: 203,
      experience: '18 ans d\'expérience',
      online: true
    }
  ];

  // Calendrier
  currentMonth = 'Novembre 2024';
  dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  calendarDays = this.generateCalendarDays();
  
  // Horaires disponibles
  availableSlots = [
    { time: '09:00', period: 'matin' },
    { time: '10:00', period: 'matin' },
    { time: '11:00', period: 'matin' },
    { time: '14:00', period: 'après-midi' },
    { time: '15:00', period: 'après-midi' },
    { time: '16:00', period: 'après-midi' },
    { time: '17:00', period: 'après-midi' }
  ];

  get filteredDoctors() {
    return this.doctors.filter(doctor => 
      this.specialties.find(s => s.id === this.selectedSpecialty)?.name === doctor.specialty
    );
  }

  selectSpecialty(specialtyId: string) {
    this.selectedSpecialty = specialtyId;
  }

  selectDoctor(doctorId: string) {
    this.selectedDoctor = doctorId;
  }

  selectDate(date: string, available: boolean) {
    if (available) {
      this.selectedDate = date;
    }
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  confirmAppointment() {
    // Logique de confirmation du rendez-vous
    console.log('Rendez-vous confirmé:', {
      specialty: this.selectedSpecialty,
      doctor: this.selectedDoctor,
      date: this.selectedDate,
      time: this.selectedTime
    });
    
    // Redirection ou affichage d'un message de succès
    alert('Votre rendez-vous a été confirmé avec succès !');
  }

  getSpecialtyName(specialtyId: string): string {
    return this.specialties.find(s => s.id === specialtyId)?.name || '';
  }

  getDoctorName(doctorId: string): string {
    return this.doctors.find(d => d.id === doctorId)?.name || '';
  }

  generateCalendarDays() {
    // Génération simplifiée des jours du calendrier
    const days = [];
    for (let i = 1; i <= 30; i++) {
      days.push({
        number: i,
        date: `2024-11-${i.toString().padStart(2, '0')}`,
        available: Math.random() > 0.3, // 70% de disponibilité
        slots: Math.floor(Math.random() * 5) + 1 // 1-5 créneaux disponibles
      });
    }
    return days;
  }

  getAvailabilityDots(slots: number): number[] {
    return Array(slots).fill(0);
  }

  prevMonth() {
    // Logique de navigation du calendrier
    console.log('Mois précédent');
  }

  nextMonth() {
    // Logique de navigation du calendrier
    console.log('Mois suivant');
  }
}