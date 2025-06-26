import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadOrderTableComponent } from './bad-order-table.component';

describe('BadOrderTableComponent', () => {
  let component: BadOrderTableComponent;
  let fixture: ComponentFixture<BadOrderTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BadOrderTableComponent]
    });
    fixture = TestBed.createComponent(BadOrderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
