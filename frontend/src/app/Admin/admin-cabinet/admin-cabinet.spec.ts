import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCabinet } from './admin-cabinet';

describe('AdminCabinet', () => {
  let component: AdminCabinet;
  let fixture: ComponentFixture<AdminCabinet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCabinet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCabinet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
