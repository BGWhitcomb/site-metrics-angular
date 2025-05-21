import { Component } from '@angular/core';


interface Railcar {
  carMark: string;
  carNumber: string;
  inspectedDate: string;
  repaired: boolean;
  repairDescription: string;
  isEmpty: boolean;
  badOrdered: boolean;
  badOrderDate: string;
  badOrderDescription: string;
}

@Component({
  selector: 'app-railcar-inspection-list',
  templateUrl: './railcar-inspection-list.component.html',
  styleUrls: ['./railcar-inspection-list.component.css']
})
export class RailcarInspectionListComponent {
  railcars: Railcar[] = []
  // add ngOnInit to init railcars array, call service here?
  }