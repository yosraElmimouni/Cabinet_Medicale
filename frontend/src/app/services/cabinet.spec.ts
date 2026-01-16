import { TestBed } from '@angular/core/testing';

import { Cabinet, CabinetService } from './cabinet';

describe('CabinetService', () => {
  let service: CabinetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CabinetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
