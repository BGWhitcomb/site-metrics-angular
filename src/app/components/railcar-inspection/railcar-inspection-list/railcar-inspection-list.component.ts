/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { InspectionService } from 'src/app/services/inspection.service';
import { InboundRailcar } from '../models/inbound-railcar';
import { BadOrderedRailcar } from '../models/bad-ordered-railcar';
import { finalize, Observable, Subject, takeUntil, forkJoin } from 'rxjs';

// tracking for client side inline table editing before submitting to backend
interface InspectionQueue {
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


  queue: InspectionQueue = {
    new: [],
    modified: []
  }

  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  allBadOrders: BadOrderedRailcar[] = [];

  selectedRows: Set<number> = new Set();
  selectAll = false;
  editMode = false;

  editingRows: Set<number> = new Set();
  rowBackups: Map<number, InboundRailcar> = new Map();

  errorMessage = '';
  successMessage = '';
  loading = false;
  public Math = Math;

  // Tabs
  activeTab: TabType = 'inspections';

  // Pagination & Sorting
  page = 1;
  pageSize = 50;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  //keyboard behavior

  focusNext($event: Event): void {
    const target = $event.target as HTMLInputElement;
    const inputs = Array.from(document.querySelectorAll('input, select, textarea')) as HTMLInputElement[];
    const currentIndex = inputs.indexOf(target);

    // Find the next input that is not disabled
    for (let i = currentIndex + 1; i < inputs.length; i++) {
      if (!inputs[i].disabled) {
        inputs[i].focus();
        break;
      }
    }
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

  toggleLoadStatus(row: InboundRailcar): void {

    /// WORK ON THIS IF UNCHECKED LOADED, IF CHECKED UNLOADED
    if (!this.queue.modified.some(r => r.inboundId === row.inboundId)) {
      this.queue.modified.push({ ...row });
    }
  }


  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.selectedRows.clear();

    if (this.selectAll) {
      this.pagedData.forEach((row) => {
        const inboundId = row.inboundId;

        this.selectedRows.add(inboundId);

        // Apply same edit logic as toggleSelect
        if (!this.editingRows.has(inboundId)) {
          // Only create backup for existing rows (not new empty rows)
          if (inboundId > 0) {
            const inspectionRow = this.inspections.find(r => r.inboundId === inboundId);
            if (inspectionRow) {
              this.rowBackups.set(inboundId, { ...inspectionRow });
            }
          }
          this.editingRows.add(inboundId);
        }
      });
    } else {
      // When deselecting all, cancel all edits
      Array.from(this.editingRows).forEach(inboundId => {
        this.cancelEdit(inboundId);
      });
    }

    this.updateEditMode();
  }

  toggleSelect(inboundId: number): void {
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

      this.selectedRows.add(inboundId);
    }
    this.updateEditMode();
  }

  private updateEditMode(): void {
    this.editMode = this.selectedRows.size > 0;
  }

  private destroy$ = new Subject<void>();

  constructor(private inspectionService: InspectionService) { }

  ngOnInit() {
    this.sortColumn = 'inspectedDate'; // Default sort column
    this.sortDirection = 'desc'; // Default sort direction

    this.loadDataForActiveTab();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
    this.page = 1;
    this.loadDataForActiveTab();
  }


  private generateRowId(): number {
    return -(Date.now() + Math.floor(Math.random() * 1000));
  }
  addNewInspection(): void {
    const emptyRow: InboundRailcar = {
      inboundId: this.generateRowId(),
      carMark: '',
      carNumber: '',
      isRepaired: false,
      repairDescription: '',
      isEmpty: true,
      inspectedDate: new Date().toISOString().split('T')[0],
      badOrdered: false, // if true, create badOrderedRailcar
      badOrderedRailcar: undefined  // Start as undefined
    };

    this.inspections.unshift(emptyRow);

    this.page = 1;


    this.editingRows.add(emptyRow.inboundId!);


    this.selectedRows.add(emptyRow.inboundId!);

    this.updateEditMode();


    setTimeout(() => {
      const firstInput = document.querySelector('.editing-row input') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 0);
  }
  // Inline update methods

  isEditing(inboundId: number): boolean {
    return this.editingRows.has(inboundId);
  }

  cancelAllEdits(): void {

    const idsToCancel = new Set<number>([
      ...this.selectedRows,
      ...this.editingRows,
    ]);

    idsToCancel.forEach((inboundId) => this.cancelEdit(inboundId));

    this.queue.new = [];
    this.queue.modified = [];

    this.updateEditMode();
  }

  cancelEdit(inboundId: number): void {
    // Check if this is a new empty row (has negative temp ID)
    if (inboundId < 0) {
      this.inspections = this.inspections.filter(row => row.inboundId !== inboundId);

      this.editingRows.delete(inboundId);
      this.selectedRows.delete(inboundId);

      this.updateEditMode();
    } else {
      if (this.rowBackups.has(inboundId)) {
        const rowIndex = this.inspections.findIndex(row => row.inboundId === inboundId);
        if (rowIndex !== -1) {
          this.inspections[rowIndex] = { ...this.rowBackups.get(inboundId)! };
        }


        this.editingRows.delete(inboundId);
        this.rowBackups.delete(inboundId);
        this.selectedRows.delete(inboundId);


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
    return this.queue.new.length > 0 ||
      this.queue.modified.length > 0;
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
        this.queue.new.push({ ...row });
      } else {  // Existing row
        this.queue.modified.push({ ...row });
      }

      // Clean up editing state for this row only
      this.editingRows.delete(inboundId);
      this.rowBackups.delete(inboundId);
      this.selectedRows.delete(inboundId);

      // Update edit mode
      this.updateEditMode();


      this.successMessage = `Rows Saved. Click Submit to save to server.`;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please fill in all required fields for this row';
      this.successMessage = '';
    }
  }

  // for save button that appears at selectAll location for batch saves
  saveSelectedRows(): void {
    let validRowCount = 0;
    const totalSelectedRows = this.selectedRows.size;

    Array.from(this.selectedRows).forEach(inboundId => {

      const row = this.pagedData.find(r => r.inboundId === inboundId);
      if (row && this.validateRow(row)) {
        validRowCount++;
        if (this.editingRows.has(inboundId)) {
          this.queue.new.push({ ...row });
        } else {
          this.queue.modified.push({ ...row });
        }
        this.editingRows.delete(inboundId);
        this.rowBackups.delete(inboundId);
      }
    });

    if (validRowCount === totalSelectedRows && totalSelectedRows > 0) {
      this.successMessage = 'Changes stored. Click Submit to save.';
      this.selectedRows.clear();
      this.errorMessage = '';
    } else if (totalSelectedRows > 0) {
      this.errorMessage = 'Please fill in all required fields';
      this.successMessage = '';
    }
  }

  submitInspections(): void {
    if (this.queue.new.length === 0 && this.queue.modified.length === 0) {
      this.errorMessage = 'No changes to submit';
      return;
    }

    const allChanges = [...this.queue.new, ...this.queue.modified] as InboundRailcar[];

    this.loading = true;

    (this.inspectionService.addInspections(allChanges) as Observable<InboundRailcar[]>).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = 'All changes saved successfully';
        this.queue = { new: [], modified: [] };
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

  deleteInspections(): void {
    if (this.selectedRows.size === 0 && this.selectAll === false) {
      this.errorMessage = "No selected rows to delete.";
      return;
    }

    // Get the actual row objects, not just IDs
    const selectedRowsArray = Array.from(this.selectedRows)
      .map(id => this.inspections.find(row => row.inboundId === id))
      .filter(row => row !== undefined) as InboundRailcar[];

    // Find intersection of selected and editing rows (by ID comparison)
    const selectedAndEditingIds = Array.from(this.selectedRows)
      .filter(selectedId => this.editingRows.has(selectedId));

    // Separate positive IDs (backend delete) from negative IDs (local only)
    const toDeleteFromBackend = selectedRowsArray.filter(row => row.inboundId! > 0);
    const toDeleteLocally = selectedRowsArray.filter(row => row.inboundId! < 0);

    this.loading = true;
    this.errorMessage = '';

    // Create observables array for backend deletions
    const deleteObservables: Observable<void>[] = [];

    if (toDeleteFromBackend.length > 0) {
      toDeleteFromBackend.forEach(row => {
        deleteObservables.push(
          this.inspectionService.deleteInspection(row.inboundId!.toString(), row)
        );
      });
    }

    // Execute all delete operations
    if (deleteObservables.length > 0) {
      forkJoin(deleteObservables).subscribe({
        next: () => {
          this.handleDeleteSuccess(selectedRowsArray, selectedAndEditingIds);
        },
        error: (error) => {
          console.error('Error deleting inspections:', error);
          this.errorMessage = 'Failed to delete some inspections. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // Only local deletions (negative IDs)
      this.handleDeleteSuccess(selectedRowsArray, selectedAndEditingIds);
    }
  }

  private handleDeleteSuccess(deletedRows: InboundRailcar[], deletedEditingIds: number[]): void {
    const deletedIds = deletedRows.map(row => row.inboundId);

    this.inspections = this.inspections.filter(inspection =>
      !deletedIds.includes(inspection.inboundId)
    );

    deletedIds.forEach(id => this.selectedRows.delete(id!));

    deletedEditingIds.forEach(id => this.editingRows.delete(id));

    deletedIds.forEach(id => this.rowBackups.delete(id!));

    this.queue.new = this.queue.new.filter(row => !deletedIds.includes(row.inboundId));
    this.queue.modified = this.queue.modified.filter(row => !deletedIds.includes(row.inboundId));

    this.selectAll = false;
    this.updateEditMode();

    this.loading = false;

    this.successMessage = `Successfully deleted ${deletedRows.length} inspections`;
    console.log(`Successfully deleted ${deletedRows.length} inspections`);
    console.log(`Removed ${deletedEditingIds.length} rows from editing state`);
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

      if (this.sortColumn === 'inspectedDate') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return this.sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

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