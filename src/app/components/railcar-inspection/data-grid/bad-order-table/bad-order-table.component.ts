import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationService } from '../services/pagination.service';
import { BadOrderedRailcar } from '../../models/inspections';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'app-bad-order-table',
  templateUrl: './bad-order-table.component.html',
  styleUrls: ['./bad-order-table.component.css']
})
export class BadOrderTableComponent {
  // input data
  @Input() selectAll: boolean = false;
  @Input() selectedRows: Set<number> = new Set();
  // @Input() badOrders: BadOrderedRailcar[] = [];
  @Input() pagedState: Pagination<BadOrderedRailcar> | null = null;

  // output data
  @Output() handleRepairDateChange = new EventEmitter<any>();
  @Output() updateBadOrderDate = new EventEmitter<{ newDate: string, row: BadOrderedRailcar }>();
  @Output() updateBadOrderDescription = new EventEmitter<{ newDescription: string, row: BadOrderedRailcar }>();
  @Output() toggleSelect = new EventEmitter<number>();
  @Output() toggleSelectAll = new EventEmitter<BadOrderedRailcar[]>();
  @Output() saveIndividualRow = new EventEmitter<number>();
  @Output() cancelEdit = new EventEmitter<number>();
  @Output() setSort = new EventEmitter<string>();
  @Output() setPage = new EventEmitter<number>();
  loading = false;
  Math = Math;

  datePickerOpen: { [id: number]: boolean } = {};

  toggleDatePicker(row: BadOrderedRailcar): void {
    const id = row.badOrderId;
    if (id == null) return;
    this.datePickerOpen[id] = !this.datePickerOpen[id];
  }

  isDatePickerOpen(row: BadOrderedRailcar): boolean {
    const id = row.badOrderId;
    return id != null ? !!this.datePickerOpen[id] : false;
  }

  closeDatePicker(row: BadOrderedRailcar): void {
    const id = row.badOrderId;
    if (id == null) return;
    this.datePickerOpen[id] = false;
  }

  onRepairDateChange(newDate: string, row: BadOrderedRailcar): void {
    this.handleRepairDateChange.emit({ newDate, row });
    this.closeDatePicker(row);
  }
  onUpdateBadOrderDate(newDate: string, row: BadOrderedRailcar) {
    this.updateBadOrderDate.emit({ newDate, row });
  }
  onUpdateBadOrderDescription(newDescription: string, row: BadOrderedRailcar) {
    this.updateBadOrderDescription.emit({ newDescription, row });
  }
  onToggleSelect(rowId: number) {
    this.toggleSelect.emit(rowId);
  }
  onToggleSelectAll() {
    this.toggleSelectAll.emit(this.pagedState?.data || []);
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