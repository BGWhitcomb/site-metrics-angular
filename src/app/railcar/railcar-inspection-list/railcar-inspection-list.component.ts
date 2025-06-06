import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { InspectionService } from '../inspection.service';
import { InboundRailcar } from '../inbound-railcar';
import { BadOrderedRailcar } from '../bad-ordered-railcar';
import { finalize, Subject, takeUntil } from 'rxjs';


type TabType = 'inspections' | 'bad-orders' | 'all-bad-orders';

@Component({
  selector: 'app-railcar-inspection-list',
  templateUrl: './railcar-inspection-list.component.html',
  styleUrls: ['./railcar-inspection-list.component.css']
})
export class RailcarInspectionListComponent implements OnInit, OnDestroy {
  toggleRepairDescription(_t70: InboundRailcar) {
    throw new Error('Method not implemented.');
  }
  removeEditingRow(_t71: number) {
    throw new Error('Method not implemented.');
  }
  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  allBadOrders: BadOrderedRailcar[] = [];

  selectedRows: Set<number> = new Set();
  selectAll: boolean = false;
  editMode: boolean = false;

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.selectedRows.clear();

    if (this.selectAll) {
      this.pagedData.forEach((_, index) => this.selectedRows.add(index));
    }
    this.updateEditMode();
  }

  toggleRowSelection(index: number): void {
    if (this.selectedRows.has(index)) {
      this.selectedRows.delete(index);
    } else {
      this.selectedRows.add(index);
    }
    this.selectAll = this.selectedRows.size === this.pagedData.length;
    this.updateEditMode();
  }

  private updateEditMode(): void {
    this.editMode = this.selectedRows.size > 0;
  }

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  public Math = Math;

  // Tabs
  activeTab: TabType = 'inspections';

  // Pagination & Sorting
  page = 1;
  pageSize = 50;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  private destroy$ = new Subject<void>();

  constructor(private inspectionService: InspectionService) { }

  ngOnInit() {
    // Load data based on active tab initially
    this.loadDataForActiveTab();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
    this.page = 1; // Reset pagination when switching tabs
    this.loadDataForActiveTab();
  }

  // New inspection adds a new row to the editing list
  editingRows: InboundRailcar[] = [];
  editIndex: number | null = null;
  addNewInspection(): void {
    const today = new Date().toISOString().split('T')[0];
    const emptyInspection: InboundRailcar = {
      carMark: '',
      carNumber: '',
      inspectedDate: today,
      isRepaired: false,
      repairDescription: '',
      badOrdered: false,
      isEmpty: true
    };
    this.editingRows.unshift(emptyInspection);
    this.editIndex = 0;
    setTimeout(() => {
      const firstInput = document.querySelector('.editing-row input') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    });
  }

  // Add method to save edited row
  rowLength: number = 0;
  saveEditedRow(index: number): void {
    const editedRow = this.editingRows[index];
    if (this.validateRow(editedRow)) {
      this.inspections.unshift(editedRow);
      this.editingRows.splice(index, 1);
    }
  }

  saveSelectedRows(): void {
    const selectedInspections = this.pagedData.filter((_, index) =>
      this.selectedRows.has(index)
    );

    if (selectedInspections.length === 0) {
      this.errorMessage = 'No inspections selected to save';
      return;
    }

    let savedCount = 0;
    let hasError = false;

    selectedInspections.forEach((inspection, idx) => {
      this.inspectionService.addInspection(inspection).subscribe({
        next: () => {
          savedCount++;
          if (savedCount === selectedInspections.length && !hasError) {
            this.successMessage = 'Selected inspections saved successfully';
            this.selectedRows.clear();
            this.selectAll = false;
          }
        },
        error: (error) => {
          hasError = true;
          this.errorMessage = 'Error saving inspections';
          console.error('Error saving inspection:', error);
        }
      });
    });
  }

  // Add validation method
  private validateRow(row: InboundRailcar): boolean {
    return row.carMark?.trim() !== '' && row.carNumber !== null;
  }

  focusNext(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const nextInput = target.parentElement?.nextElementSibling?.querySelector('input');
    if (nextInput instanceof HTMLInputElement) {
      nextInput.focus();
    }
  }

  submitEditedRows(): void {
    const validRows = this.editingRows.filter(row => this.validateRow(row));
    if (validRows.length > 0) {
      this.inspections.unshift(...validRows);
      this.editingRows = [];
      this.editIndex = null;
    }
  }


  private loadDataForActiveTab() {
    this.clearMessages();

    switch (this.activeTab) {
      case 'inspections':
        if (this.inspections.length === 0) {
          this.loadInspections();
        }
        break;
      case 'bad-orders':
        if (this.badOrders.length === 0) {
          this.loadBadOrders();
        }
        break;
      case 'all-bad-orders':
        if (this.allBadOrders.length === 0) {
          this.loadAllBadOrders();
        }
        break;
    }
  }

  private loadInspections() {
    this.loading = true;
    this.inspectionService.getInspections()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: data => {
          this.inspections = data;
          this.successMessage = `Loaded ${data.length} inspections`;
        },
        error: err => {
          console.error('Failed to load inspections:', err);
          this.errorMessage = 'Failed to load inspections';
        }
      });
  }

  private loadBadOrders() {
    this.loading = true;
    this.inspectionService.getBadOrders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: data => {
          // Log the received data for debugging
          console.log('Bad orders received:', data);
          console.log('Bad orders length:', data.length);
          this.badOrders = data;

          // Check filtering
          const activeBadOrders = data.filter(order => order.isActive);
          console.log('Active bad orders:', activeBadOrders);
          console.log('Active bad orders length:', activeBadOrders.length);

          this.successMessage = `Loaded ${data.length} bad orders`;
        },
        error: err => {
          console.error('Failed to load bad orders:', err);
          this.errorMessage = 'Failed to load bad orders';
        }
      });
  }

  private loadAllBadOrders() {
    this.loading = true;
    this.inspectionService.getAllBadOrders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: data => {
          this.allBadOrders = data;
          this.successMessage = `Loaded ${data.length} total bad orders`;
        },
        error: err => {
          console.error('Failed to load all bad orders:', err);
          this.errorMessage = 'Failed to load all bad orders';
        }
      });
  }

  // Pagination helpers
  get totalPages(): number {
    const totalItems = this.getCurrentTabData().length;
    return Math.ceil(totalItems / this.pageSize);
  }

  private getCurrentTabData(): any[] {
    switch (this.activeTab) {
      case 'inspections': return this.inspections;
      case 'bad-orders': return this.badOrders.filter(order => order.isActive);
      case 'all-bad-orders': return this.allBadOrders;
      default: return [];
    }
  }

  get pagedData() {
    let data = this.getCurrentTabData();

    // Apply sorting
    if (this.sortColumn) {
      data = this.sortData(data);
    }

    // Apply pagination
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  private sortData(data: any[]): any[] {
    return [...data].sort((a, b) => {
      const aValue = a[this.sortColumn as keyof any];
      const bValue = b[this.sortColumn as keyof any];

      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
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
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
    }
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Public method to refresh current tab data
  refreshCurrentTab() {
    switch (this.activeTab) {
      case 'inspections':
        this.inspections = [];
        this.loadInspections();
        break;
      case 'bad-orders':
        this.badOrders = [];
        this.loadBadOrders();
        break;
      case 'all-bad-orders':
        this.allBadOrders = [];
        this.loadAllBadOrders();
        break;
    }
  }
}