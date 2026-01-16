import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderSec } from './header-sec';

describe('HeaderSec', () => {
  let component: HeaderSec;
  let fixture: ComponentFixture<HeaderSec>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSec,RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderSec);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
