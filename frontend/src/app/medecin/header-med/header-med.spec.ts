import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMed } from './header-med';

describe('HeaderMed', () => {
  let component: HeaderMed;
  let fixture: ComponentFixture<HeaderMed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderMed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
