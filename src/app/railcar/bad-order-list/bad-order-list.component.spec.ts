import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadOrderListComponent } from './bad-order-list.component';

describe('BadOrderListComponent', () => {
  let component: BadOrderListComponent;
  let fixture: ComponentFixture<BadOrderListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BadOrderListComponent]
    });
    fixture = TestBed.createComponent(BadOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
