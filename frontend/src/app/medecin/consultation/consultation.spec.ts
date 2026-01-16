import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationComponent } from './consultation';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConsultationService } from '../../services/consultation';
import { RendezVousService } from '../../services/rendez-vous';

describe('ConsultationComponent', () => {
  let component: ConsultationComponent;
  let fixture: ComponentFixture<ConsultationComponent>;

  // Mocks pour les services
  const mockConsultationService = {
    // ajoute les méthodes nécessaires si appelées
  };

  const mockRendezVousService = {
    // ajoute les méthodes nécessaires si appelées
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        DatePipe,
        { provide: ConsultationService, useValue: mockConsultationService },
        { provide: RendezVousService, useValue: mockRendezVousService },
      ],
      declarations: [ConsultationComponent], // nécessaire pour Jest
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize consultations array', () => {
    expect(component.consultations).toEqual([]);
    expect(component.filteredConsultations).toEqual([]);
  });

  it('should have a form with controls', () => {
    expect(component.consultationForm.contains('type')).toBe(true);
    expect(component.consultationForm.contains('dateConsultation')).toBe(true);
    expect(component.consultationForm.contains('diagnostic')).toBe(true);
  });
});
