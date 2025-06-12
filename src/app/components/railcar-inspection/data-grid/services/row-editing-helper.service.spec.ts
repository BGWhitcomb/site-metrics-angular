import { TestBed } from '@angular/core/testing';

import { RowEditingHelperService } from './row-editing-helper.service';

describe('RowEditingHelperService', () => {
  let service: RowEditingHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RowEditingHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
