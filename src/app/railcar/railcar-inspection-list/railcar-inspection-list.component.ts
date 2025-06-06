import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { InspectionService } from '../inspection.service';
import { InboundRailcar } from '../inbound-railcar';
import { BadOrderedRailcar } from '../bad-ordered-railcar';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';

// tracking for client side inline table editing before submitting to backend
interface PendingEdit {
  new: InboundRailcar[];
  modified: InboundRailcar[];
}

type TabType = 'inspections' | 'bad-orders' | 'all-bad-orders';

@Component({
  selector: 'app-railcar-inspection-list',
  templateUrl: './railcar-inspection-list.component.html',
  styleUrls: ['./railcar-inspection-list.component.css']
})
export class RailcarInspectionListComponent implements OnInit, OnDestroy {

  pendingEdit: PendingEdit = {
    new: [],
    modified: []
  }

  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  allBadOrders: BadOrderedRailcar[] = [];

  selectedRows: Set<number> = new Set();
  selectAll: boolean = false;
  editMode: boolean = false;

  editingRows: Set<number> = new Set();
  rowBackups: Map<number, InboundRailcar> = new Map();

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  public Math = Math;

  //keyboard behavior

  focusNext($event: Event) {
    throw new Error('Method not implemented.');
  }

  // toggle methods

  toggleRepairDescription(inboundId: number): void {
    // Find the row in the inspections array
    const row = this.inspections.find(r => r.inboundId === inboundId);

    if (row) {
      // If isRepaired is unchecked, clear the repair description
      if (!row.isRepaired) {
        row.repairDescription = '';
      }
    }
  }

  toggleBadOrder(inboundId: number): void {
    const row = this.inspections.find(r => r.inboundId === inboundId);

    if (row) {
      if (row.badOrdered) {
        // Create badOrderedRailcar when checkbox is checked
        if (!row.badOrderedRailcar) {
          row.badOrderedRailcar = {
            badOrderId: undefined,
            carMark: row.carMark || '',
            carNumber: parseInt(row.carNumber?.toString() || '0'),
            badOrderDate: new Date().toISOString().split('T')[0],
            badOrderDescription: '',
            isActive: true,
            repairedDate: undefined
          };
        }
      } else {
        // Remove badOrderedRailcar when checkbox is unchecked
        row.badOrderedRailcar = undefined;
      }
    }
  }


  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.selectedRows.clear();

    if (this.selectAll) {
      this.pagedData.forEach((row) => this.selectedRows.add(row.inboundId));
    }
    this.updateEditMode();
  }

  toggleEdit(inboundId: number): void {
    if (this.editingRows.has(inboundId)) {
      this.cancelEdit(inboundId);
    } else {
      // Only create backup for existing rows (not new empty rows)
      if (inboundId > 0) {
        const row = this.inspections.find(r => r.inboundId === inboundId);
        if (row) {
          this.rowBackups.set(inboundId, { ...row });
        }
      }
      this.editingRows.add(inboundId);
    }
  }

  private updateEditMode(): void {
    this.editMode = this.selectedRows.size > 0;
  }



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

  // generate placeholder id for better row assignment when adding new rows
  private generateTempId(): number {
    return -(Date.now() + Math.floor(Math.random() * 1000));
  }

  // when called, will generate an empty row for the user to fill out
  addNewInspection(): void {
    const emptyRow: InboundRailcar = {
      inboundId: this.generateTempId(), // need to clear this prior to sending to server? or handle in a different way
      carMark: '',
      carNumber: '',
      isRepaired: false,
      repairDescription: '',
      isEmpty: true,
      inspectedDate: new Date().toISOString().split('T')[0],
      badOrdered: false, // if true, create badOrderedRailcar
      badOrderedRailcar: undefined  // Start as undefined
    };

    // Add to the inspections array
    this.inspections.unshift(emptyRow);

    // Reset to first page to see the new row
    this.page = 1;

    // Start editing the new row using inboundId
    this.editingRows.add(emptyRow.inboundId!);

    // Mark as selected for easier batch operations
    this.selectedRows.add(emptyRow.inboundId!);

    // Update edit mode
    this.updateEditMode();

    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector('.editing-row input') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 0);
  }
  // Inline update methods

  isEditing(inboundId: number): boolean {
    return this.editingRows.has(inboundId);
  }



  cancelEdit(inboundId: number): void {
    // Check if this is a new empty row (has negative temp ID)
    if (inboundId < 0) {
      // Remove the empty row entirely from the inspections array
      this.inspections = this.inspections.filter(row => row.inboundId !== inboundId);

      // Clean up tracking sets
      this.editingRows.delete(inboundId);
      this.selectedRows.delete(inboundId);

      // Update edit mode
      this.updateEditMode();
    } else {
      // Handle existing rows - restore from backup
      if (this.rowBackups.has(inboundId)) {
        // Find the actual row in the inspections array and restore it
        const rowIndex = this.inspections.findIndex(row => row.inboundId === inboundId);
        if (rowIndex !== -1) {
          this.inspections[rowIndex] = { ...this.rowBackups.get(inboundId)! };
        }

        // Clean up tracking
        this.editingRows.delete(inboundId);
        this.rowBackups.delete(inboundId);
        this.selectedRows.delete(inboundId);

        // Update edit mode
        this.updateEditMode();
      }
    }
  }

  updateBadOrderDate(date: string, row: InboundRailcar): void {
    if (row.badOrdered) {
      if (!row.badOrderedRailcar) {
        // Create if it doesn't exist and badOrdered is true
        row.badOrderedRailcar = {
          badOrderId: undefined,
          carMark: row.carMark || '',
          carNumber: parseInt(row.carNumber?.toString() || '0'),
          badOrderDate: date,
          badOrderDescription: '',
          isActive: true,
          repairedDate: undefined
        };
      } else {
        // Update existing
        row.badOrderedRailcar.badOrderDate = date;
      }
    }
  }

  updateBadOrderDescription(desc: string, row: InboundRailcar): void {
    if (row.badOrdered && row.badOrderedRailcar) {
      row.badOrderedRailcar.badOrderDescription = desc;
    }
  }

  // Save methods and getters

  get hasPendingEdit(): boolean {
    return this.pendingEdit.new.length > 0 ||
      this.pendingEdit.modified.length > 0;
  }

  get hasSelectedEdits(): boolean {
    return this.selectedRows.size > 0 && this.editingRows.size > 0;
  }

  // For showing the "Save" button (when actively editing)
  get hasActiveEdits(): boolean {
    return this.editingRows.size > 0;
  }

  // For showing different button states
  get canSave(): boolean {
    return this.editingRows.size > 0 && this.selectedRows.size > 0;
  }

  get canSubmit(): boolean {
    return this.hasPendingEdit;
  }

  private validateRow(row: InboundRailcar): boolean {
    const basicValidation = Boolean(
      row.carMark?.trim() &&
      row.carNumber &&
      row.inspectedDate
    );

    // If badOrdered is true, validate badOrderedRailcar fields
    if (row.badOrdered) {
      const badOrderValidation = Boolean(
        row.badOrderedRailcar?.badOrderDate &&
        row.badOrderedRailcar?.badOrderDescription?.trim()
      );
      return basicValidation && badOrderValidation;
    }

    return basicValidation;
  }

  // for save button in row during editing
  saveIndividualRow(inboundId: number): void {
    const row = this.inspections.find(r => r.inboundId === inboundId);

    if (row && this.validateRow(row)) {
      // Determine if it's new or modified
      if (inboundId < 0) {  // New row (temp ID)
        this.pendingEdit.new.push({ ...row });
      } else {  // Existing row
        this.pendingEdit.modified.push({ ...row });
      }

      // Clean up editing state for this row only
      this.editingRows.delete(inboundId);
      this.rowBackups.delete(inboundId);
      this.selectedRows.delete(inboundId);

      // Update edit mode
      this.updateEditMode();

      this.successMessage = 'Row saved locally. Click Submit to save to server.';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please fill in all required fields for this row';
    }
  }

  // for save button that appears at selectAll location for batch saves
  saveSelectedRows(): void {
    let validRowCount = 0;
    let totalSelectedRows = this.selectedRows.size;

    Array.from(this.selectedRows).forEach(inboundId => {

      const row = this.pagedData.find(r => r.inboundId === inboundId);
      if (row && this.validateRow(row)) {
        validRowCount++;
        if (this.editingRows.has(inboundId)) {
          this.pendingEdit.new.push({ ...row });
        } else {
          this.pendingEdit.modified.push({ ...row });
        }
        this.editingRows.delete(inboundId);
        this.rowBackups.delete(inboundId);
      }
    });

    if (validRowCount === totalSelectedRows && totalSelectedRows > 0) {
      this.successMessage = 'Changes saved locally. Click Submit to save to server.';
      this.selectedRows.clear();
      this.errorMessage = '';
    } else if (totalSelectedRows > 0) {
      this.errorMessage = 'Please fill in all required fields';
      this.successMessage = '';
    }
  }

  submitInspections(): void {
    if (this.pendingEdit.new.length === 0 && this.pendingEdit.modified.length === 0) {
      this.errorMessage = 'No changes to submit';
      return;
    }

    const allChanges = [...this.pendingEdit.new, ...this.pendingEdit.modified] as InboundRailcar[];

    this.loading = true;

    (this.inspectionService.addInspections(allChanges) as Observable<InboundRailcar[]>).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = 'All changes saved successfully';
        this.pendingEdit = { new: [], modified: [] };
        this.selectedRows.clear();
        this.selectAll = false;
        this.refreshCurrentTab();
      },
      error: (error) => {
        this.errorMessage = 'Error saving changes';
        console.error('Error saving changes:', error);
      }
    });
  }

  //fetch methods

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