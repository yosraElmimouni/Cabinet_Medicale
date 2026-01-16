import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryDashboard } from './secretary-dashboard';

describe('SecretaryDashboard', () => {
  let component: SecretaryDashboard;
  let fixture: ComponentFixture<SecretaryDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
