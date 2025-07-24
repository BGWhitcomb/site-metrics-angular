import { TestBed } from '@angular/core/testing';

import { BadOrderedRailcarService } from './bad-ordered-railcar.service';

describe('BadOrderedRailcarService', () => {
  let service: BadOrderedRailcarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadOrderedRailcarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
