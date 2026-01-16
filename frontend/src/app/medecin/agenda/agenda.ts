import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// FullCalendar Imports
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

// Services
import { AuthService } from '../../services/auth'; // Ajustez le chemin
import { RendezVousService, RendezVousPatientMedcin } from '../../services/rendez-vous'; // Ajustez le chemin

interface Appointment {
  id: number;
  patientName: string;
  patientId: number;
  time: Date;
  endTime: Date;
  type: string;
  status: string;
  notes?: string;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.scss']
})
export class Agenda implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  
  appointments: Appointment[] = [];
  isLoading: boolean = false;

  // Options du calendrier
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    locale: frLocale,
    firstDay: 1,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    events: [],
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(
    private authService: AuthService,
    private rdvService: RendezVousService
  ) {}

  ngOnInit() {
    this.loadDoctorAppointments();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDoctorAppointments() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.isLoading = true;
      const sub = this.rdvService.getRendezVousMedecinPatient1(currentUser.id).subscribe({
        next: (data: RendezVousPatientMedcin[]) => {
          this.appointments = this.mapApiDataToAppointments(data);
          this.updateCalendarEvents();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des rendez-vous:', err);
          this.isLoading = false;
        }
      });
      this.subscriptions.add(sub);
    }
  }

  private mapApiDataToAppointments(data: RendezVousPatientMedcin[]): Appointment[] {
    const appointments: Appointment[] = [];
    
    data.forEach(item => {
      const patientName = `${item.patient.prenom} ${item.patient.nom}`;
      
      item.rendezVousResponse.forEach(rdv => {
        // Combiner la date du rendez-vous avec l'heure de début/fin
        const startDate = new Date(rdv.dateRdvs);
        startDate.setHours(rdv.heureDebut.getHours(), rdv.heureDebut.getMinutes());
        
        const endDate = new Date(rdv.dateRdvs);
        endDate.setHours(rdv.heureFin.getHours(), rdv.heureFin.getMinutes());

        appointments.push({
          id: rdv.idRendezVous,
          patientName: patientName,
          patientId: item.patient.idPatient,
          time: startDate,
          endTime: endDate,
          type: rdv.motif || 'Consultation',
          status: rdv.statut,
          notes: rdv.remarque
        });
      });
    });
    
    return appointments;
  }

  updateCalendarEvents() {
    this.calendarOptions.events = this.appointments.map(app => ({
      id: app.id.toString(),
      title: `${app.patientName} (${app.type})`,
      start: app.time,
      end: app.endTime,
      backgroundColor: this.getStatusColor(app.status),
      extendedProps: { appointment: app }
    }));
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmé': return '#10b981';
      case 'en attente': return '#f59e0b';
      case 'annulé': return '#ef4444';
      case 'terminé': return '#6b7280';
      default: return '#3b82f6';
    }
  }

  handleEventClick(info: any) {
    // Logique pour afficher les détails du rendez-vous
    console.log('Rendez-vous sélectionné:', info.event.extendedProps.appointment);
  }

  getConfirmedCount(): number {
    return this.appointments.filter(a => a.status.toLowerCase() === 'confirmé').length;
  }

  getPendingCount(): number {
    return this.appointments.filter(a => a.status.toLowerCase() === 'en attente').length;
  }
}
