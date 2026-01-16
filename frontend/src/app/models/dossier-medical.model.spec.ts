import { DossierMedical } from './dossier-medical.model';

describe('DossierMedical', () => {
  it('should create a valid object', () => {
    const dossier: DossierMedical = {
      antMedicaux: 'Hypertension',
      antChirurg: 'Appendicectomie',
      allergies: 'Pollen',
      traitementEnCour: 'Médicament X',
      habitudes: 'Sport régulier',
      documentsMedicaux: [],
      idMedecin: 1
    };
    expect(dossier).toBeTruthy();
    expect(dossier.antMedicaux).toBe('Hypertension');
    expect(dossier.idMedecin).toBe(1);
  });
});
