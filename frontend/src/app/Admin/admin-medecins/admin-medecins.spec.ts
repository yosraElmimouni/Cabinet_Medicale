import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMedecins } from './admin-medecins';

describe('AdminMedecins', () => {
  let component: AdminMedecins;
  let fixture: ComponentFixture<AdminMedecins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMedecins]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMedecins);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
