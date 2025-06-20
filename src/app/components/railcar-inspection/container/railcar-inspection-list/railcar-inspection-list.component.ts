import { Component, OnDestroy, OnInit } from '@angular/core';
import { InspectionService } from 'src/app/services/inspection.service';
import { InboundRailcar } from '../../models/inbound-railcar';
import { BadOrderedRailcar } from '../../models/bad-ordered-railcar';
import { finalize, Subject, takeUntil } from 'rxjs';
import { PaginationService } from '../../data-grid/services/pagination.service';
import { ToastService } from 'src/app/services/toast.service';
import { RowEditingService } from '../../data-grid/services/row-editing.service';
import { InspectionQueue } from '../../models/inspection-queue';

type TabType = 'inspections' | 'bad-orders' | 'all-bad-orders';

@Component({
  selector: 'app-railcar-inspection-list',
  templateUrl: './railcar-inspection-list.component.html',
  styleUrls: ['./railcar-inspection-list.component.css'],
  providers: [PaginationService]
})
export class RailcarInspectionListComponent implements OnInit, OnDestroy {
  queue: InspectionQueue = { new: [], modified: [] };
  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  allBadOrders: BadOrderedRailcar[] = [];
  rowBackups: Map<number, InboundRailcar> = new Map();
  selectedRows: Set<number> = new Set();

  selectAll: boolean = false;
  loading = false;
  public Math = Math;

  activeTab: TabType = 'inspections';
  private destroy$ = new Subject<void>();

  constructor(
    private inspectionService: InspectionService,
    public pagination: PaginationService<InboundRailcar>,
    public toast: ToastService,
    public edit: RowEditingService
  ) { }

  ngOnInit() {
    this.pagination.sortColumn = 'inspectedDate';
    this.pagination.sortDirection = 'desc';
    this.loadDataForActiveTab();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCurrentTabData(): any[] {
    switch (this.activeTab) {
      case 'inspections': return this.inspections;
      case 'bad-orders': return this.badOrders.filter(order => order.isActive);
      case 'all-bad-orders': return this.allBadOrders;
      default: return [];
    }
  }

  // Bad order table methods

  resolveBadOrder(row: InboundRailcar, newDate: string): void {
    this.edit.resolveBadOrder(row, newDate);
    this.pagination.setPage(1, this.getCurrentTabData());
    this.toast.show('Bad order resolved successfully', 'success');
  }

  // Inspection table methods
  addNewInspection(): void {
    this.edit.addNewRow(this.inspections, this.selectedRows);
    this.pagination.setPage(1, this.inspections);
  }

  updateBadOrderDate(event: { newDate: string, row: InboundRailcar }): void {
    this.edit.updateBadOrderDate(event.row, event.newDate);
  }

  updateBadOrderDescription(event: { newDescription: string, row: InboundRailcar }): void {
    this.edit.updateBadOrderDescription(event.row, event.newDescription);
  }

  onToggleSelect(inboundId: number) {
    this.edit.toggleSelect(inboundId, this.inspections, this.selectedRows, this.rowBackups);
  }

  onToggleSelectAll(pagedData: InboundRailcar[]) {
    this.edit.toggleSelectAll(pagedData, this.selectedRows);
  }


  // removed this button to use the action bar instead
  onSaveIndividualRow(inboundId: number) {
    this.edit.saveIndividualRow(inboundId, this.inspections, this.selectedRows, this.rowBackups, this.queue);
  }

  onCancelEdit(inboundId: number) {
    this.edit.cancelEdit(inboundId, this.inspections, this.selectedRows, this.rowBackups, this.queue);
  }

  toggleRepaired(inboundId: number) {
    this.edit.toggleRepaired(inboundId, this.inspections);
  }

  onToggleBadOrder(inboundId: number) {
    this.edit.toggleBadOrder(inboundId, this.inspections);
  }

  onToggleLoadStatus(row: InboundRailcar) {
    this.edit.toggleLoadStatus(row);
  }

  // Tab and data helpers
  setTab(tab: TabType) {
    this.activeTab = tab;
    this.pagination.page = 1;
    this.loadDataForActiveTab();
  }

  onSetSort(column: string) {
    this.pagination.setSort(column);
  }

  onSetPage(page: number) {
    this.pagination.setPage(page, this.getCurrentTabData());
  }

  // Action Bar Methods
  cancelAllEdits(): void {
    this.edit.cancelAllEdits(this.inspections, this.selectedRows, this.rowBackups, this.queue);
    this.selectAll = false;
    this.toast.show('All edits cancelled', 'info');
  }

  saveSelectedRows(): void {
    this.edit.saveSelectedRows(this.inspections, this.selectedRows, this.rowBackups, this.queue);
  }

  deleteSelectedRows(): void {
    const result = this.edit.deleteInspections(this.inspections, this.selectedRows, this.rowBackups, this.queue);
    if (result && typeof result.subscribe === 'function') {
      result.subscribe({
        next: () => {
          this.edit.handleDeleteSuccess(
            Array.from(this.selectedRows).map(id => this.inspections.find(row => row.inboundId === id)).filter(Boolean) as InboundRailcar[],
            this.inspections,
            this.selectedRows,
            this.rowBackups,
            this.queue
          );
          this.refreshCurrentTab();
        },
        error: () => {
          this.toast.show('Failed to delete some inspections. Please try again.', 'error');
          this.edit.loading = false;
        }
      });
    }
  }

  submitInspections(): void {
    this.edit.submitInspections(this.queue, this.selectedRows).subscribe({
      next: () => {
        this.toast.show('All changes saved successfully', 'success');
        this.queue.new = [];
        this.queue.modified = [];
        this.selectedRows.clear();
        this.refreshCurrentTab();
      },
      error: (error) => {
        this.toast.show('Error saving changes', 'error');
        console.error('Error saving changes:', error);
      }
    });
  }

  get activeBadOrders(): InboundRailcar[] {
    return this.inspections.filter(order => order.badOrderedRailcar?.isActive);
  }

  // Data loading
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
          this.toast.show(`Loaded ${data.length} inspections`, "success");
        },
        error: err => {
          console.error('Failed to load inspections:', err);
          this.toast.show('Failed to load inspections', 'error');
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
          this.badOrders = data;
          this.toast.show(`Loaded ${data.length} bad orders`, 'success');
        },
        error: err => {
          console.error('Failed to load bad orders:', err);
          this.toast.show('Failed to load bad orders', 'error');
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
          this.toast.show(`Loaded ${data.length} total bad orders`, 'success');
        },
        error: err => {
          console.error('Failed to load all bad orders:', err);
          this.toast.show('Failed to load all bad orders', 'error');
        }
      });
  }

  private loadDataForActiveTab() {
    switch (this.activeTab) {
      case 'inspections':
        if (this.inspections.length === 0) this.loadInspections();
        break;
      case 'bad-orders':
        if (this.badOrders.length === 0) this.loadBadOrders();
        break;
      case 'all-bad-orders':
        if (this.allBadOrders.length === 0) this.loadAllBadOrders();
        break;
    }
  }

  private refreshCurrentTab() {
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

  // Keyboard navigation
  focusNext($event: KeyboardEvent): void {
    const target = $event.target as HTMLInputElement;
    const inputs = Array.from(document.querySelectorAll('input, select, textarea')) as HTMLInputElement[];
    const currentIndex = inputs.indexOf(target);
    for (let i = currentIndex + 1; i < inputs.length; i++) {
      if (!inputs[i].disabled) {
        inputs[i].focus();
        break;
      }
    }
  }

  // Getters for pagination state
  get pagedData() {
    return this.pagination.getPagedData(this.getCurrentTabData());
  }
  get sortColumn(): string {
    return this.pagination.sortColumn;
  }
  get sortDirection(): 'asc' | 'desc' {
    return this.pagination.sortDirection;
  }
  get page(): number {
    return this.pagination.page;
  }
  get totalPages(): number {
    return this.pagination.getTotalPages(this.getCurrentTabData());
  }
  get showingFrom(): number {
    return this.pagination.getShowingFrom();
  }
  get showingTo(): number {
    return this.pagination.getShowingTo(this.getCurrentTabData());
  }

  // Getters for action bar state
  get isEditing(): boolean {
    return this.selectedRows.size > 0;
  }
  get hasPendingEdit(): boolean {
    return this.queue.new.length > 0 || this.queue.modified.length > 0;
  }
  get hasSelectedEdits(): boolean {
    return this.selectedRows.size > 0;
  }
  get hasActiveEdits(): boolean {
    return this.selectedRows.size > 0;
  }
  get canSave(): boolean {
    return this.selectedRows.size > 0;
  }
  get canSubmit(): boolean {
    return this.hasPendingEdit;
  }
}