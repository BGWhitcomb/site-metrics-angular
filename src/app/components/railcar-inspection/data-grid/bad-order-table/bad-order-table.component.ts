import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastService } from '../../../../services/toast.service';
import { PaginationService } from '../services/pagination.service';
import { RowEditingService } from '../services/row-editing.service';
import { InboundRailcar } from '../../models/inbound-railcar';

@Component({
  selector: 'app-bad-order-table',
  templateUrl: './bad-order-table.component.html',
  styleUrls: ['./bad-order-table.component.css'],
  providers: [PaginationService]
})
export class BadOrderTableComponent {
  // input data
  @Input() selectAll: boolean = false;
  @Input() selectedRows: Set<number> = new Set();
  @Input() badOrders: InboundRailcar[] = [];
  @Input() showingTo!: number;
  @Input() showingFrom!: number;
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() pagedData: InboundRailcar[] = [];

  // output data
  @Output() handleRepairDateChange = new EventEmitter<any>();
  @Output() updateBadOrderDate = new EventEmitter<{ newDate: string, row: InboundRailcar }>();
  @Output() updateBadOrderDescription = new EventEmitter<{ newDescription: string, row: InboundRailcar }>();
  @Output() toggleSelect = new EventEmitter<number>();
  @Output() toggleSelectAll = new EventEmitter<InboundRailcar[]>();
  @Output() saveIndividualRow = new EventEmitter<number>();
  @Output() cancelEdit = new EventEmitter<number>();
  @Output() setSort = new EventEmitter<string>();
  @Output() setPage = new EventEmitter<number>();
  loading = false;
  Math = Math;

  datePickerOpen: { [id: number]: boolean } = {};

  constructor(
    public pagination: PaginationService<InboundRailcar>
  ) { }

  
  toggleDatePicker(row: InboundRailcar): void {
    const id = row.badOrderedRailcar?.badOrderId;
    if (id == null) return;
    this.datePickerOpen[id] = !this.datePickerOpen[id];
  }

  isDatePickerOpen(row: InboundRailcar): boolean {
    const id = row.badOrderedRailcar?.badOrderId;
    return id != null ? !!this.datePickerOpen[id] : false;
  }

  closeDatePicker(row: InboundRailcar): void {
    const id = row.badOrderedRailcar?.badOrderId;
    if (id == null) return;
    this.datePickerOpen[id] = false;
  }

  // Handle date change, emit to parent, and close picker
  onRepairDateChange(newDate: string, row: InboundRailcar): void {
    this.handleRepairDateChange.emit({ newDate, row });
    this.closeDatePicker(row);
  }
  onUpdateBadOrderDate(newDate: string, row: InboundRailcar) {
    this.updateBadOrderDate.emit({ newDate, row });
  }
  onUpdateBadOrderDescription(newDescription: string, row: InboundRailcar) {
    this.updateBadOrderDescription.emit({ newDescription, row });
  }
  onToggleSelect(rowId: number) {
    this.toggleSelect.emit(rowId);
  }
  onToggleSelectAll() {
    this.toggleSelectAll.emit(this.pagedData);
  }
  onSaveIndividualRow(rowId: number) {
    this.saveIndividualRow.emit(rowId);
  }
  onCancelEdit(rowId: number) {
    this.cancelEdit.emit(rowId);
  }
  onSetSort(column: string) {
    this.setSort.emit(column);
  }

  onSetPage(page: number) {
    this.setPage.emit(page);
  }
}