import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrendreRDVComponent } from './prend-rdv';

describe('PrendreRDVComponent', () => {
  let component: PrendreRDVComponent;
  let fixture: ComponentFixture<PrendreRDVComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrendreRDVComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrendreRDVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
