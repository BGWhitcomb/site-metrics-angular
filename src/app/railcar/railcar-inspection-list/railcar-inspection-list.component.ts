import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { InspectionService } from '../inspection.service';
import { InboundRailcar } from '../inbound-railcar';
import { BadOrderedRailcar } from '../bad-ordered-railcar';


type TabType = 'inspections' | 'bad-orders' | 'all-bad-orders';

@Component({
  selector: 'app-railcar-inspection-list',
  templateUrl: './railcar-inspection-list.component.html',
  styleUrls: ['./railcar-inspection-list.component.css']
})
export class RailcarInspectionListComponent implements OnInit, OnDestroy {
  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  allBadOrders: BadOrderedRailcar[] = [];
  badOrdered: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  public Math = Math; // Expose Math for use in templates

  // Tabs for the inspection list
  activeTab: TabType = 'inspections';
  setTab(tab: TabType) { this.activeTab = tab; }



  // Sorting and Pagination logic per tab
  page = 1;
  pageSize = 50; // Amount of railcars per page, will make this dynamic later
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get totalPages(): number {
    return Math.ceil(this.inspections.length / this.pageSize);
  }

  get pagedInspections() {
    // Filter active inspections and bad orders
    let data = [...this.inspections];

    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        const aValue = a[this.sortColumn as keyof InboundRailcar];
        const bValue = b[this.sortColumn as keyof InboundRailcar];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get pagedBadOrders() {
    // Filter active bad orders
    let data = this.badOrders.filter(order => order.isActive);
    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        const aValue = a[this.sortColumn as keyof BadOrderedRailcar];
        const bValue = b[this.sortColumn as keyof BadOrderedRailcar];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get pagedAllBadOrders() {
    // Filter all bad orders
    let data = [...this.allBadOrders];
    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        const aValue = a[this.sortColumn as keyof BadOrderedRailcar];
        const bValue = b[this.sortColumn as keyof BadOrderedRailcar];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
  }

  setPage(page: number) {
    this.page = page;
  }




  constructor(private inspectionService: InspectionService) { }

  // Initialize component and load data from the service
  // This will be called when the component is created
  // and will load the inspections, bad orders, and all bad orders.
  // It will also set the loading state to true while the data is being fetched.
  // Might need to load only if the tab is active
  ngOnInit() {
    this.loading = true;
    this.loadInspections();
    this.loadBadOrders();
    this.loadAllBadOrders();
  }

  //need to call this method when the component is destroyed to clean up resources
  ngOnDestroy() {
    // Cleanup if necessary
    this.inspections = [];
    this.badOrders = [];
    this.allBadOrders = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadInspections() {
    this.loading = true;
    this.inspectionService.getInspections().subscribe({
      next: data => { this.inspections = data; this.loading = false; },
      error: err => { this.errorMessage = 'Failed to load inspections'; this.loading = false; }
    });
  }

  loadBadOrders() {
    this.inspectionService.getBadOrders().subscribe({
      next: data => this.badOrders = data,
      error: err => this.errorMessage = 'Failed to load bad orders'
    });
  }

  loadAllBadOrders() {
    this.inspectionService.getAllBadOrders().subscribe({
      next: data => this.allBadOrders = data,
      error: err => this.errorMessage = 'Failed to load all bad orders'
    });
  }

}