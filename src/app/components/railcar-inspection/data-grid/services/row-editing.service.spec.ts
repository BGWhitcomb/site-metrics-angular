import { TestBed } from '@angular/core/testing';

import { RowEditingService } from './row-editing.service';

describe('RowEditingHelperService', () => {
  let service: RowEditingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RowEditingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
