import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendRDV } from './rend-rdv';

describe('RendRDV', () => {
  let component: RendRDV;
  let fixture: ComponentFixture<RendRDV>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendRDV]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendRDV);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
