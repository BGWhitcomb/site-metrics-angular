import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RailcarInspectionListComponent } from './railcar-inspection-list.component';

describe('RailcarInspectionListComponent', () => {
  let component: RailcarInspectionListComponent;
  let fixture: ComponentFixture<RailcarInspectionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RailcarInspectionListComponent]
    });
    fixture = TestBed.createComponent(RailcarInspectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
