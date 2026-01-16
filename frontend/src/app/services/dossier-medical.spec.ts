import { TestBed } from '@angular/core/testing';

import { DossierMedicalService } from './dossier-medical';

describe('DossierMedical', () => {
  let service: DossierMedicalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DossierMedicalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
