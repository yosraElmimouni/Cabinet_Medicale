import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attent } from './attent';

describe('Attent', () => {
  let component: Attent;
  let fixture: ComponentFixture<Attent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Attent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
