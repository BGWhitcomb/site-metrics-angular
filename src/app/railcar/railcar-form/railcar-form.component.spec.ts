import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RailcarFormComponent } from './railcar-form.component';

describe('RailcarFormComponent', () => {
  let component: RailcarFormComponent;
  let fixture: ComponentFixture<RailcarFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RailcarFormComponent]
    });
    fixture = TestBed.createComponent(RailcarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
