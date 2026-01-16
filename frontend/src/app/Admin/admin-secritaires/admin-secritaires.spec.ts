import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSecritaires } from './admin-secritaires';

describe('AdminSecritaires', () => {
  let component: AdminSecritaires;
  let fixture: ComponentFixture<AdminSecritaires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSecritaires]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSecritaires);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
