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
  badOrdered: boolean = false;
  // add ngOnInit to init railcars array, call service here?

  //this is just a test with google labs stitch...
  activeTab: 'inspections' | 'bad-orders' | 'all-bad-orders' = 'inspections';

  setTab(tab: 'inspections' | 'bad-orders' | 'all-bad-orders') {
    this.activeTab = tab;
  }



  // Example data for demonstration
  inspections = [
    {
      carMark: 'PSRX',
      carNumber: '123456',
      inspected: 'Jan 15, 2024',
      repaired: true,
      repairDescription: 'Replaced brake shoe',
      badOrdered: true,
      badOrderDate: 'Jan 16, 2024',
      badOrderDescription: 'Loose Backing Ring L2'
    },
    {
      carMark: 'UTLX',
      carNumber: '789012',
      inspected: 'Jan 18, 2024',
      repaired: false,
      repairDescription: '',
      badOrdered: false,
      badOrderDate: '',
      badOrderDescription: ''
    },
    {
      carMark: 'UTLX',
      carNumber: '789012',
      inspected: 'Jan 18, 2024',
      repaired: false,
      repairDescription: '',
      badOrdered: false,
      badOrderDate: '',
      badOrderDescription: ''
    },
    {
      carMark: 'UTLX',
      carNumber: '345678',
      inspected: 'Jan 20, 2024',
      repaired: true,
      repairDescription: 'Replaced coupler',
      badOrdered: true,
      badOrderDate: 'Jan 21, 2024',
      badOrderDescription: 'Needs new coupler'
    },
    {
      carMark: 'PSRX',
      carNumber: '123456',
      inspected: 'Jan 15, 2024',
      repaired: true,
      repairDescription: 'Replaced brake shoe',
      badOrdered: false,
      badOrderDate: '',
      badOrderDescription: ''
    }
  ];

  badOrders = [
    {
      carMark: 'PSRX',
      carNumber: '123456',
      badOrderDate: 'Jan 16, 2024',
      badOrderDescription: 'Loose Backing Ring L2'
    },
    {
      carMark: 'UTLX',
      carNumber: '345678',
      badOrderDate: 'Jan 21, 2024',
      badOrderDescription: 'Needs new coupler'
    }
  ];

  allBadOrders = [
    {
      carMark: 'UTLX',
      carNumber: '555000',
      badOrderDate: 'Dec 01, 2023',
      badOrderDescription: 'Bent grab iron',
      resolvedDate: 'Dec 05, 2023'
    },
    {
      carMark: 'PSRX',
      carNumber: '123456',
      badOrderDate: 'Jan 16, 2024',
      badOrderDescription: 'Loose Backing Ring L2',
      resolvedDate: 'Pending'
    }
  ];

}