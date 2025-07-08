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

  // Observables for ui paged data

  pagedData$ = this.edit.inspections$.pipe(
    map(data => this.paginationInspection.getPagedData(data)),
    takeUntil(this.destroy$)
  )
  pagedBadOrders$ = this.edit.badOrders$.pipe(
    map(data => this.paginationBadOrders.getPagedData(data)),
    takeUntil(this.destroy$)
  )
  pagedAllBadOrders$ = this.edit.allBadOrders$.pipe(
    map(data => this.paginationAllBadOrders.getPagedData(data)),
    takeUntil(this.destroy$)
  )

  ngOnInit() {
    this.loadDataForActiveTab();

    this.paginationInspection.sortColumn = 'inspectedDate';
    this.paginationInspection.sortDirection = 'desc';
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

  private getCurrentTabData(): any[] {
    switch (this.activeTab) {
      case 'inspections': return this.inspections;
      case 'bad-orders': return this.activeBadOrders;
      case 'all-bad-orders': return this.allBadOrders;
      default: return [];
    }
  }

  // --- Bad order table methods ---
  resolveBadOrder(row: BadOrderedRailcar, newDate: string): void {
    this.edit.resolveBadOrder(row, newDate).subscribe({
      next: () => {
        this.paginationBadOrders.setPage(1, this.getCurrentTabData());
        this.toast.show('Bad order resolved successfully', 'success');
      },
      error: (err) => {
        this.toast.show('Failed to resolve bad order: ' + err.message, 'error');
      }
    });
  }

  exportBadOrders(): void {
    this.exp.exportBadOrders(this.edit.badOrders);
  }

  // --- Inspection table methods ---
  addNewInspection(): void {
    this.edit.addNewRow(this.inspections, this.selectedRows);
    this.paginationInspection.setPage(1, this.inspections);
    this.paginationInspection.sortColumn = 'inspectedDate';
    this.paginationInspection.sortDirection = 'desc';
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

  // --- Tab and data helpers ---
  setTab(tab: TabType) {
    this.activeTab = tab;
    this.paginationInspection.page = 1;
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

  // --- Getters for inspection pagination ---
  get pagedData() {
    return this.paginationInspection.getPagedData(this.getCurrentTabData());
  }
  get sortColumn(): string {
    return this.paginationInspection.sortColumn;
  }
  get sortDirection(): 'asc' | 'desc' | '' {
    return this.paginationInspection.sortDirection;
  }
  get page(): number {
    return this.paginationInspection.page;
  }
  get totalPages(): number {
    return this.paginationInspection.getTotalPages(this.getCurrentTabData());
  }
  get showingFrom(): number {
    return this.paginationInspection.getShowingFrom();
  }
  get showingTo(): number {
    return this.paginationInspection.getShowingTo(this.getCurrentTabData());
  }


  // For badOrders table
  get pagedBadOrders() {
    return this.paginationBadOrders.getPagedData(this.getCurrentTabData());
  }
  get sortColumnBO(): string {
    return this.paginationBadOrders.sortColumn;
  }
  get sortDirectionBO(): 'asc' | 'desc' | '' {
    return this.paginationBadOrders.sortDirection;
  }
  get pageBO(): number {
    return this.paginationBadOrders.page;
  }
  get totalPagesBO(): number {
    return this.paginationBadOrders.getTotalPages(this.getCurrentTabData());
  }
  get showingFromBO(): number {
    return this.paginationBadOrders.getShowingFrom();
  }
  get showingToBO(): number {
    return this.paginationBadOrders.getShowingTo(this.getCurrentTabData());
  }

  // for allBadOrders table
  get pagedAllBadOrders() {
    return this.paginationAllBadOrders.getPagedData(this.getCurrentTabData());
  }
  get sortColumnAllBO(): string {
    return this.paginationAllBadOrders.sortColumn;
  }
  get sortDirectionAllBO(): 'asc' | 'desc' | '' {
    return this.paginationAllBadOrders.sortDirection;
  }
  get pageAllBO(): number {
    return this.paginationAllBadOrders.page;
  }
  get totalPagesAllBO(): number {
    return this.paginationAllBadOrders.getTotalPages(this.getCurrentTabData());
  }
  get showingFromAllBO(): number {
    return this.paginationAllBadOrders.getShowingFrom();
  }
  get showingToAllBO(): number {
    return this.paginationAllBadOrders.getShowingTo(this.getCurrentTabData());
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