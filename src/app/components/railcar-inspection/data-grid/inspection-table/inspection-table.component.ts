import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InboundRailcar } from '../../models/inspections';
import { PaginationService } from '../services/pagination.service';
import { RowEditingService } from '../services/row-editing.service';
import { ToastService } from 'src/app/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-inspection-table',
  templateUrl: './inspection-table.component.html',
  styleUrls: ['./inspection-table.component.css']
})
export class InspectionTableComponent {

  // input data
  @Input() selectAll: boolean = false;
  @Input() selectedRows: Set<number> = new Set();
  @Input() inspections: InboundRailcar[] = [];
  @Input() showingTo!: number;
  @Input() showingFrom!: number;
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' | '' = 'asc';
  @Input() pagedData: InboundRailcar[] = [];

  loading = false;
  Math = Math;

  // output data
  @Output() addNewInspection = new EventEmitter<void>();
  @Output() updateBadOrderDate = new EventEmitter<{ newDate: string, row: InboundRailcar }>();
  @Output() updateBadOrderDescription = new EventEmitter<{ newDescription: string, row: InboundRailcar }>();
  @Output() toggleRepaired = new EventEmitter<number>();
  @Output() toggleBadOrder = new EventEmitter<number>();
  @Output() toggleLoadStatus = new EventEmitter<InboundRailcar>();
  @Output() toggleSelect = new EventEmitter<number>();
  @Output() toggleSelectAll = new EventEmitter<InboundRailcar[]>();
  @Output() saveIndividualRow = new EventEmitter<number>();
  @Output() cancelEdit = new EventEmitter<number>();
  @Output() setSort = new EventEmitter<string>();
  @Output() setPage = new EventEmitter<number>();


  constructor(
    public edit: RowEditingService,
    public toast: ToastService
  ) { }


  // refactor this to use the pagination service
  onSetSort(column: string) {
    this.setSort.emit(column);
  }
  onSetPage(page: number) {
    this.setPage.emit(page);
  }

  // Editing/selecting methods


  onAddClick(): void {
    this.addNewInspection.emit()
  }

  onBadOrderDateUpdate(newDate: string, row: InboundRailcar): void {
    this.updateBadOrderDate.emit({ newDate, row });
  }

  onBadOrderDescriptionUpdate(newDescription: string, row: InboundRailcar): void {
    this.updateBadOrderDescription.emit({ newDescription, row });
  }

  onToggleSelect(inboundId: number) {
    this.toggleSelect.emit(inboundId);
  }

  onToggleSelectAll() {
    this.toggleSelectAll.emit(this.pagedData);
  }

  onSaveIndividualRow(inboundId: number) {
    this.saveIndividualRow.emit(inboundId);
  }

  onCancelEdit(inboundId: number) {
    this.cancelEdit.emit(inboundId);
  }

  onToggleRepaired(inboundId: number) {
    this.toggleRepaired.emit(inboundId);
  }

  onToggleBadOrder(inboundId: number) {
    this.toggleBadOrder.emit(inboundId);
  }

  onToggleLoadStatus(row: InboundRailcar) {
    this.toggleLoadStatus.emit(row);
  }

}