import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSupHeader } from './admin-sup-header';

describe('AdminSupHeader', () => {
  let component: AdminSupHeader;
  let fixture: ComponentFixture<AdminSupHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSupHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSupHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
