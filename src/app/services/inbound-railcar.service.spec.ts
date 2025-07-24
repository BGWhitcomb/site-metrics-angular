import { TestBed } from '@angular/core/testing';

import { InboundRailcarService } from './inbound-railcar.service';

describe('InboundRailcarService', () => {
  let service: InboundRailcarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InboundRailcarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
