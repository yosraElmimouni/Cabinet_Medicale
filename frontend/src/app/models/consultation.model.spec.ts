import { ConsultationRequest, ConsultationResponse, Patient, FactureResponse, MedicalRecordConsultationList } from './consultation.model';

describe('Consultation Models', () => {
  describe('ConsultationRequest', () => {
    it('should create a valid ConsultationRequest', () => {
      const request: ConsultationRequest = {
        type: 'Générale',
        dateConsultation: new Date().toISOString(),
        examenClinique: 'Examen normal',
        examenSupplementaire: 'Aucun',
        diagnostic: 'Grippe',
        traitement: 'Repos et hydratation',
        observations: 'Patient stable',
        idDossierMedical: 1,
        idMedecin: 1,
        idRendezVous: 1
      };
      expect(request).toBeTruthy();
      expect(request.type).toBe('Générale');
      expect(request.diagnostic).toBe('Grippe');
    });

    it('should create ConsultationRequest with minimal fields', () => {
      const request: ConsultationRequest = {
        type: 'Suivi',
        dateConsultation: new Date().toISOString(),
        examenClinique: '',
        examenSupplementaire: '',
        diagnostic: '',
        traitement: '',
        observations: '',
        idDossierMedical: 1,
        idMedecin: 1
      };
      expect(request).toBeTruthy();
      expect(request.idRendezVous).toBeUndefined();
    });
  });

  describe('ConsultationResponse', () => {
    it('should create a valid ConsultationResponse', () => {
      const response: ConsultationResponse = {
        idConsultation: 1,
        type: 'Urgence',
        dateConsultation: new Date().toISOString(),
        examenClinique: 'Examen urgent',
        examenSupplementaire: 'Scanner',
        diagnostic: 'Fracture',
        traitement: 'Plâtre',
        observations: 'Patient en douleur',
        idDossierMedical: 1,
        facture: {
          idFacture: 1,
          montant: 500,
          statut: 'Payée'
        },
        idMedecin: 1,
        nomMedecin: 'Dr. Martin',
        idRendezVous: 1
      };
      expect(response).toBeTruthy();
      expect(response.idConsultation).toBe(1);
      expect(response.facture?.montant).toBe(500);
    });

    it('should create ConsultationResponse with optional facture', () => {
      const response: ConsultationResponse = {
        idConsultation: 2,
        type: 'Contrôle',
        dateConsultation: new Date().toISOString(),
        examenClinique: 'Visite périodique',
        examenSupplementaire: '',
        diagnostic: 'Bon état de santé',
        traitement: 'Aucun',
        observations: 'Suivi régulier',
        idDossierMedical: 2,
        idMedecin: 2,
        nomMedecin: 'Dr. Dubois'
      };
      expect(response).toBeTruthy();
      expect(response.facture).toBeUndefined();
    });
  });

  describe('Patient', () => {
    it('should create a valid Patient', () => {
      const patient: Patient = {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1990-01-15',
        gender: 'Masculin',
        bloodGroup: 'O+',
        allergies: ['Pénicilline'],
        chronicDiseases: ['Diabète'],
        status: 'actif',
        avatar: 'avatar.jpg',
        email: 'jean@example.com',
        phone: '+33612345678'
      };
      expect(patient).toBeTruthy();
      expect(patient.nom).toBe('Dupont');
      expect(patient.allergies.length).toBe(1);
    });
  });

  describe('FactureResponse', () => {
    it('should create a valid FactureResponse', () => {
      const facture: FactureResponse = {
        idFacture: 1,
        montant: 150,
        statut: 'En attente'
      };
      expect(facture).toBeTruthy();
      expect(facture.montant).toBe(150);
      expect(facture.statut).toBe('En attente');
    });
  });

  describe('MedicalRecordConsultationList', () => {
    it('should create a valid MedicalRecordConsultationList', () => {
      const patient: Patient = {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1990-01-15',
        gender: 'Masculin',
        bloodGroup: 'O+',
        allergies: [],
        chronicDiseases: [],
        status: 'actif'
      };

      const consultations: ConsultationResponse[] = [
        {
          idConsultation: 1,
          type: 'Générale',
          dateConsultation: new Date().toISOString(),
          examenClinique: 'Normal',
          examenSupplementaire: '',
          diagnostic: 'Sain',
          traitement: 'Aucun',
          observations: 'RAS',
          idDossierMedical: 1,
          idMedecin: 1
        }
      ];

      const list: MedicalRecordConsultationList = {
        idDossier: 1,
        patient: patient,
        consultations: consultations
      };

      expect(list).toBeTruthy();
      expect(list.patient.nom).toBe('Dupont');
      expect(list.consultations.length).toBe(1);
    });
  });
});
