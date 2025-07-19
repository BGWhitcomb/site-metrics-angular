import { Component, OnDestroy, OnInit } from '@angular/core';
import { InspectionService } from 'src/app/services/inspection.service';
import { InboundRailcar, BadOrderedRailcar } from '../../models/inspections';
import { finalize, Subject, takeUntil, Subscription, map } from 'rxjs';
import { PaginationService } from '../../data-grid/services/pagination.service';
import { ToastService } from 'src/app/services/toast.service';
import { RowEditingService } from '../../data-grid/services/row-editing.service';
import { ExportService } from '../../data-grid/services/export.service';

type TabType = 'inspections' | 'bad-orders' | 'all-bad-orders';

@Component({
  selector: 'app-railcar-inspection-list',
  templateUrl: './railcar-inspection-list.component.html',
  styleUrls: ['./railcar-inspection-list.component.css'],
  providers: [PaginationService]
})
export class RailcarInspectionListComponent implements OnInit, OnDestroy {

  loading = false;
  public Math = Math;
  activeTab: TabType = 'inspections';
  private destroy$ = new Subject<void>();

  constructor(
    private inspectionService: InspectionService,
    public paginationInspection: PaginationService<InboundRailcar>,
    public paginationBadOrders: PaginationService<BadOrderedRailcar>,
    public paginationAllBadOrders: PaginationService<BadOrderedRailcar>,
    public toast: ToastService,
    public edit: RowEditingService,
    public exp: ExportService
  ) { }

  pagedInspectionsState$ = this.paginationInspection.pagedState$;
  pagedBadOrdersState$ = this.paginationBadOrders.pagedState$;
  pagedAllBadOrdersState$ = this.paginationAllBadOrders.pagedState$;

  ngOnInit() {
    this.loadDataForActiveTab();

    this.paginationInspection.setSort('inspectedDate', 'desc');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Getters for SSOT state ---
  get inspections() { return this.edit.inspections; }
  get badOrders() { return this.edit.badOrders; }
  get allBadOrders() { return this.edit.allBadOrders; }
  get selectedRows() { return this.edit.selectedRows; }
  get deletedRows() { return this.edit.deletedRows; }
  get rowBackups() { return this.edit.rowBackups; }
  get boRowBackups() { return this.edit.boRowBackups; }
  get queue() { return this.edit.inspectionQueue; }
  get badOrderQueue() { return this.edit.badOrderQueue; }
  get selectAll() { return this.edit.selectAll; }
  set selectAll(val: boolean) { this.edit.selectAll = val; }

  // --- Bad order table methods ---
  resolveBadOrder(row: BadOrderedRailcar, newDate: string): void {
    this.edit.resolveBadOrder(row, newDate).subscribe({
      next: () => {
        this.paginationBadOrders.setPage(1);
        this.toast.show('Bad order resolved successfully', 'success');
      },
      error: (err) => {
        this.toast.show('Failed to resolve bad order: ' + err.message, 'error');
      }
    });
  }

  exportBadOrders(): void {
    this.exp.exportBadOrders(this.edit.badOrders);
    if (!this.edit.badOrders.length) {
      this.toast.show('No bad orders to export', 'info');
    }
  }

  // --- Inspection table methods ---
  addNewInspection(): void {
    this.edit.addNewRow(this.inspections, this.selectedRows);
    this.paginationInspection.setData(this.inspections);
    this.paginationInspection.setPage(1);
    this.paginationInspection.setSort('inspectedDate', 'desc');
  }

  updateBadOrderDate(event: { newDate: string, row: InboundRailcar }): void {
    this.edit.updateBadOrderDate(event.row, event.newDate);
    if (this.activeTab === 'bad-orders') {
      this.paginationBadOrders.setData(this.edit.badOrders);
    }
    else if (this.activeTab === 'inspections') {
      this.paginationInspection.setData(this.edit.inspections);
    }

  }

  updateBadOrderDescription(event: { newDescription: string, row: InboundRailcar }): void {
    this.edit.updateBadOrderDescription(event.row, event.newDescription);
  }

  onToggleSelect(inboundId: number) {
    this.edit.toggleSelect(inboundId, this.inspections, this.selectedRows, this.rowBackups);
  }

  onToggleSelectAll(pagedData: InboundRailcar[]) {
    this.edit.toggleSelectAll(pagedData, this.selectedRows);
    this.paginationInspection.setData(this.inspections);
  }

  onSaveIndividualRow(inboundId: number) {
    this.edit.saveIndividualRow(inboundId, this.inspections, this.selectedRows, this.rowBackups, this.queue);
  }

  onCancelEdit(inboundId: number) {
    this.edit.toggleSelect(inboundId, this.inspections, this.selectedRows, this.rowBackups);
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

  // --- Tab and data helpers ---
  setTab(tab: TabType) {
    this.activeTab = tab;
    this.paginationInspection.setPage(1);
    this.loadDataForActiveTab();
  }

  // --- Action Bar Methods ---
  cancelAllEdits(): void {
    this.edit.cancelAllEdits(this.inspections, this.selectedRows, this.rowBackups, this.queue);
    this.selectAll = false;
    this.toast.show('All edits cancelled', 'info');
  }

  saveSelectedRows(): void {
    this.edit.saveSelectedRows(this.inspections, this.selectedRows, this.rowBackups, this.queue)
  }

  deleteSelectedRows(): void {
    this.edit.deleteInspections(this.inspections, this.selectedRows, this.rowBackups, this.queue)
      .subscribe({
        next: (deletedRows) => {
          this.edit.handleDeleteSuccess(deletedRows, this.inspections, this.selectedRows, this.rowBackups, this.queue);
          this.paginationInspection.setData(this.inspections);
          this.refreshCurrentTab();
        },
        error: () => {
          this.toast.show('Failed to delete some inspections. Please try again.', 'error');
          this.edit.loading = false;
        }
      });
  }

  submitInspections(): void {
    this.edit.submitInspections(this.queue, this.selectedRows).subscribe({
      next: () => {
        this.toast.show('All changes saved successfully', 'success');
        this.edit.inspectionQueue.new = [];
        this.edit.inspectionQueue.modified = [];
        this.edit.selectedRows.clear();
        this.refreshCurrentTab();
      },
      error: (error) => {
        this.toast.show('Error saving changes', 'error');
        console.error('Error saving changes:', error);
      }
    });
  }

  get activeBadOrders(): BadOrderedRailcar[] {
    return this.badOrders.filter(order => order.isActive);
  }

  // --- Data loading ---
  private loadInspections() {
    this.loading = true;
    this.inspectionService.getInspections()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: data => {
          this.edit.inspections = data;
          this.paginationInspection.setData(data);
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
          this.edit.badOrders = data;
          this.paginationBadOrders.setData(data);
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
          this.edit.allBadOrders = data;
          this.paginationAllBadOrders.setData(data);
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
        this.edit.inspections = [];
        this.loadInspections();
        break;
      case 'bad-orders':
        this.edit.badOrders = [];
        this.loadBadOrders();
        break;
      case 'all-bad-orders':
        this.edit.badOrders = [];
        this.loadAllBadOrders();
        break;
    }
  }

  // --- Keyboard navigation ---
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

  // --- Getters for action bar state ---
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