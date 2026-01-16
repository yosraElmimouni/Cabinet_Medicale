import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prescriptions } from './prescriptions';

describe('Prescriptions', () => {
  let component: Prescriptions;
  let fixture: ComponentFixture<Prescriptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prescriptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Prescriptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
