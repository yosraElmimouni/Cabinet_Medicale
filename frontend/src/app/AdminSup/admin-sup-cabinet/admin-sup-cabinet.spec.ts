import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSupCabinet } from './admin-sup-cabinet';

describe('AdminSupCabinet', () => {
  let component: AdminSupCabinet;
  let fixture: ComponentFixture<AdminSupCabinet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSupCabinet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSupCabinet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
