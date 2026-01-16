import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierMedicalComponent } from './dossier-medical';

describe('DossierMedicalComponent', () => {
  let component: DossierMedicalComponent;
  let fixture: ComponentFixture<DossierMedicalComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierMedicalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierMedicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
