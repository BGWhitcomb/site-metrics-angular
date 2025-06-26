import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBadOrdersTableComponent } from './all-bad-orders-table.component';

describe('AllBadOrdersTableComponent', () => {
  let component: AllBadOrdersTableComponent;
  let fixture: ComponentFixture<AllBadOrdersTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllBadOrdersTableComponent]
    });
    fixture = TestBed.createComponent(AllBadOrdersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
