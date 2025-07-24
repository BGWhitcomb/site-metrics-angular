import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, EMPTY, finalize, forkJoin, map, of } from 'rxjs';
import { InboundRailcar, BadOrderedRailcar } from '../../models/inspections';
import { InspectionQueue, BadOrderQueue } from '../../models/inspection-queue';
import { ToastService } from 'src/app/services/toast.service';
import { InboundRailcarService } from 'src/app/services/inbound-railcar.service';
import { BadOrderedRailcarService } from 'src/app/services/bad-ordered-railcar.service';

@Injectable({
  providedIn: 'root'
})
export class RowEditingService {
  // --- Reactive SSOT State ---
  private _inspections = new BehaviorSubject<InboundRailcar[]>([]);
  private _badOrders = new BehaviorSubject<BadOrderedRailcar[]>([]);
  private _allBadOrders = new BehaviorSubject<BadOrderedRailcar[]>([]);
  private _selectedRows = new BehaviorSubject<Set<number>>(new Set());
  private _rowBackups = new BehaviorSubject<Map<number, InboundRailcar>>(new Map());
  private _boRowBackups = new BehaviorSubject<Map<number, BadOrderedRailcar>>(new Map());
  private _inspectionQueue = new BehaviorSubject<InspectionQueue>({ new: [], modified: [] });
  private _badOrderQueue = new BehaviorSubject<BadOrderQueue>({ new: [], modified: [] });
  private _selectAll = new BehaviorSubject<boolean>(false);
  private _loading = new BehaviorSubject<boolean>(false);
  private _deletedRows = new BehaviorSubject<InboundRailcar[]>([]);

  // --- Observables for components to subscribe to, reactive ui state ---
  badOrders$ = this._badOrders.asObservable().pipe(
    map(badOrders => badOrders.filter(order => order.isActive))
  );
  inspections$ = this._inspections.asObservable();
  allBadOrders$ = this._allBadOrders.asObservable();
  selectedRows$ = this._selectedRows.asObservable();
  rowBackups$ = this._rowBackups.asObservable();
  boRowBackups$ = this._boRowBackups.asObservable();
  inspectionQueue$ = this._inspectionQueue.asObservable();
  badOrderQueue$ = this._badOrderQueue.asObservable();
  selectAll$ = this._selectAll.asObservable();
  loading$ = this._loading.asObservable();
  deletedRows$ = this._deletedRows.asObservable();

  // --- Synchronous getters/setters ---
  get inspections() { return this._inspections.value; }
  set inspections(val: InboundRailcar[]) { this._inspections.next(val); }
  get badOrders() { return this._badOrders.value.filter(order => order.isActive); }
  set badOrders(val: BadOrderedRailcar[]) { this._badOrders.next(val); }
  get allBadOrders() { return this._allBadOrders.value; }
  set allBadOrders(val: BadOrderedRailcar[]) { this._allBadOrders.next(val); }
  get selectedRows() { return this._selectedRows.value; }
  set selectedRows(val: Set<number>) { this._selectedRows.next(val); }
  get rowBackups() { return this._rowBackups.value; }
  set rowBackups(val: Map<number, InboundRailcar>) { this._rowBackups.next(val); }
  get boRowBackups() { return this._boRowBackups.value; }
  set boRowBackups(val: Map<number, BadOrderedRailcar>) { this._boRowBackups.next(val); }
  get inspectionQueue() { return this._inspectionQueue.value; }
  set inspectionQueue(val: InspectionQueue) { this._inspectionQueue.next(val); }
  get badOrderQueue() { return this._badOrderQueue.value; }
  set badOrderQueue(val: BadOrderQueue) { this._badOrderQueue.next(val); }
  get selectAll() { return this._selectAll.value; }
  set selectAll(val: boolean) { this._selectAll.next(val); }
  get loading() { return this._loading.value; }
  set loading(val: boolean) { this._loading.next(val); }
  get deletedRows() { return this._deletedRows.value; }
  set deletedRows(val: InboundRailcar[]) { this._deletedRows.next(val); }

  constructor(private toast: ToastService, private inboundService: InboundRailcarService, private badOrderService: BadOrderedRailcarService) { }

  // --- Type Guards ---
  private isInboundRailcar(row: any): row is InboundRailcar {
    return 'carMark' in row && 'inspectedDate' in row;
  }
  private isBadOrderedRailcar(row: any): row is BadOrderedRailcar {
    return 'badOrderId' in row && 'badOrderDate' in row;
  }

  // --- Shared Row Selection ---
  selectRow<T extends { inboundId: number }>(
    inboundId: number,
    rows: T[],
    selectedRows: Set<number>,
    rowBackups: Map<number, T>
  ): void {
    if (!selectedRows.has(inboundId)) {
      const updatedSelected = new Set(selectedRows);
      updatedSelected.add(inboundId);
      this.selectedRows = updatedSelected;

      const row = rows.find(r => r.inboundId === inboundId);
      if (row && !rowBackups.has(inboundId)) {
        const updatedBackups = new Map(rowBackups);
        updatedBackups.set(inboundId, { ...row });
        if (this.isInboundRailcar(row)) this.rowBackups = updatedBackups as unknown as Map<number, InboundRailcar>;
        else this.boRowBackups = updatedBackups as unknown as Map<number, BadOrderedRailcar>;
      }
    }
  }

  deselectRow<T extends { inboundId: number }>(
    inboundId: number,
    rows: T[],
    selectedRows: Set<number>,
    rowBackups: Map<number, T>
  ): void {
    if (selectedRows.has(inboundId)) {
      const backup = rowBackups.get(inboundId);
      if (backup) {
        const idx = rows.findIndex(r => r.inboundId === inboundId);
        if (idx !== -1) rows[idx] = { ...backup };
        const updatedBackups = new Map(rowBackups);
        updatedBackups.delete(inboundId);
        if (this.isInboundRailcar(backup)) this.rowBackups = updatedBackups as unknown as Map<number, InboundRailcar>;
        else this.boRowBackups = updatedBackups as unknown as Map<number, BadOrderedRailcar>;
      }
      const updatedSelected = new Set(selectedRows);
      updatedSelected.delete(inboundId);
      this.selectedRows = updatedSelected;
    }
  }

  // --- Cancel Edit(s) ---
  cancelEdit<T extends { inboundId: number }>(
    inboundId: number,
    rows: T[],
    selectedRows: Set<number>,
    rowBackups: Map<number, T>,
    queue: { new: T[]; modified: T[] }
  ): void {
    if (inboundId < 0) {
      const idx = rows.findIndex(row => row.inboundId === inboundId);
      if (idx !== -1) rows.splice(idx, 1);
      const updatedSelected = new Set(selectedRows);
      updatedSelected.delete(inboundId);
      this.selectedRows = updatedSelected;
      this.updateEditMode(updatedSelected, queue);
    } else {
      if (rowBackups.has(inboundId)) {
        const rowIndex = rows.findIndex(row => row.inboundId === inboundId);
        if (rowIndex !== -1) {
          rows[rowIndex] = { ...rowBackups.get(inboundId)! };
        }
        const updatedBackups = new Map(rowBackups);
        updatedBackups.delete(inboundId);
        if (rows.length && this.isInboundRailcar(rows[0])) this.rowBackups = updatedBackups as unknown as Map<number, InboundRailcar>;
        else this.boRowBackups = updatedBackups as unknown as Map<number, BadOrderedRailcar>;
        const updatedSelected = new Set(selectedRows);
        updatedSelected.delete(inboundId);
        this.selectedRows = updatedSelected;
        this.updateEditMode(updatedSelected, queue);
      }
    }
  }

  cancelAllEdits<T extends { inboundId: number }>(
    rows: T[],
    selectedRows: Set<number>,
    rowBackups: Map<number, T>,
    queue: { new: T[]; modified: T[] }
  ): void {
    const idsToCancel = Array.from(selectedRows);
    idsToCancel.forEach((inboundId) =>
      this.cancelEdit(inboundId, rows, selectedRows, rowBackups, queue)
    );
    queue.new = [];
    queue.modified = [];
    this.selectedRows = new Set();
    this.updateEditMode(this.selectedRows, queue);
  }

  // --- Edit Mode Helper ---
  private updateEditMode<T>(selectedRows: Set<number>, queue: { new: T[]; modified: T[] }): void {
    if (selectedRows.size === 0) {
      this.selectAll = false;
    }
    if (selectedRows.size === 0 && queue.new.length === 0 && queue.modified.length === 0) {
      queue.new = [];
      queue.modified = [];
    }
  }

  // --- Validation ---
  private validateRow<T extends { inboundId: number }>(row: T): boolean {
    if (this.isInboundRailcar(row)) {
      const basicValidation = Boolean(
        row.carMark?.trim() &&
        row.carNumber &&
        row.inspectedDate
      );
      if (row.badOrdered) {
        const badOrderValidation = Boolean(
          row.badOrderedRailcar?.badOrderDate &&
          row.badOrderedRailcar?.badOrderDescription?.trim()
        );
        return basicValidation && badOrderValidation;
      }
      return basicValidation;
    } else if (this.isBadOrderedRailcar(row)) {
      return Boolean(
        row.badOrderDate &&
        row.badOrderDescription?.trim()
      );
    }
    return false;
  }

  // --- Update Bad Order Fields ---
  updateBadOrderDate<T extends { inboundId: number }>(row: T, newDate: string): void {
    if (this.isInboundRailcar(row)) {
      if (!row.badOrderedRailcar) {
        row.badOrderedRailcar = {
          badOrderId: 0,
          inboundId: row.inboundId,
          carMark: row.carMark,
          carNumber: row.carNumber,
          badOrderDate: '',
          badOrderDescription: '',
          isActive: true
        };
      }
      row.badOrderedRailcar.badOrderDate = newDate;
    } else if (this.isBadOrderedRailcar(row)) {
      row.badOrderDate = newDate;
    }
  }

  updateBadOrderDescription<T extends { inboundId: number }>(row: T, newDescription: string): void {
    if (this.isInboundRailcar(row)) {
      if (!row.badOrderedRailcar) {
        row.badOrderedRailcar = {
          badOrderId: 0,
          inboundId: row.inboundId,
          carMark: row.carMark,
          carNumber: row.carNumber,
          badOrderDate: '',
          badOrderDescription: '',
          isActive: true
        };
      }
      row.badOrderedRailcar.badOrderDescription = newDescription;
    } else if (this.isBadOrderedRailcar(row)) {
      row.badOrderDescription = newDescription;
    }
  }

  cancelBadOrderEdit(
    badOrderId: number,
    badOrders: BadOrderedRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, BadOrderedRailcar>,
    queue: { new: BadOrderedRailcar[]; modified: BadOrderedRailcar[] }
  ): void {
    const row = badOrders.find(r => r.badOrderId === badOrderId);
    if (row) {
      const updatedBackups = new Map(rowBackups);
      updatedBackups.delete(badOrderId);
      this.boRowBackups = updatedBackups;
      const updatedSelected = new Set(selectedRows);
      updatedSelected.delete(badOrderId);
      this.selectedRows = updatedSelected;
      this.updateEditMode(updatedSelected, queue);
    }
  }

  // --- Save Individual Row ---
  saveIndividualRow<T extends { inboundId: number }>(
    inboundId: number,
    rows: T[],
    selectedRows: Set<number>,
    rowBackups: Map<number, T>,
    queue: { new: T[]; modified: T[] }
  ): void {
    const row = rows.find(r => r.inboundId === inboundId);
    if (row && this.validateRow(row)) {
      if (inboundId < 0) {
        queue.new.push({ ...row });
      } else {
        queue.modified.push({ ...row });
      }
      const updatedBackups = new Map(rowBackups);
      updatedBackups.delete(inboundId);
      if (this.isInboundRailcar(row)) this.rowBackups = updatedBackups as unknown as Map<number, InboundRailcar>;
      else this.boRowBackups = updatedBackups as unknown as Map<number, BadOrderedRailcar>;
      const updatedSelected = new Set(selectedRows);
      updatedSelected.delete(inboundId);
      this.selectedRows = updatedSelected;
      this.updateEditMode(updatedSelected, queue);
      this.toast.show(`Rows Saved. Click Submit to save to server.`, 'success');
    } else {
      this.toast.show('Please fill in all required fields', 'error');
    }
  }

  // --- Save Selected Rows ---
  saveSelectedRows<T extends { inboundId: number }>(
    rows: T[],
    selectedRows: Set<number>,
    rowBackups: Map<number, T>,
    queue: { new: T[]; modified: T[] }
  ): void {
    let validRowCount = 0;
    const totalSelectedRows = selectedRows.size;
    Array.from(selectedRows).forEach(inboundId => {
      const row = rows.find(r => r.inboundId === inboundId);
      if (row && this.validateRow(row)) {
        validRowCount++;
        if (inboundId < 0) {
          queue.new.push({ ...row });
        } else {
          queue.modified.push({ ...row });
        }
        const updatedBackups = new Map(rowBackups);
        updatedBackups.delete(inboundId);
        if (row && this.isInboundRailcar(row)) this.rowBackups = updatedBackups as unknown as Map<number, InboundRailcar>;
        else this.boRowBackups = updatedBackups as unknown as Map<number, BadOrderedRailcar>;
      }
    });
    if (validRowCount === totalSelectedRows && totalSelectedRows > 0) {
      this.selectedRows = new Set();
      this.toast.show('Changes stored. Click Submit to save.', 'success');
    } else if (totalSelectedRows > 0) {
      this.toast.show('Please fill in all required fields', 'error');
    }
  }

  // --- Resolve Bad Order ---
  resolveBadOrder(row: BadOrderedRailcar, newDate: string): Observable<BadOrderedRailcar> {
    if (!newDate) throw new Error('A valid repaired date must be provided.');
    if (!row.isActive) throw new Error('Cannot resolve a bad order that is not active.');
    row.repairedDate = newDate;
    row.isActive = false;
    return this.badOrderService.updateBadOrder(row.badOrderId.toString(), row);
  }

  // --- Toggle Logic (InboundRailcar only) ---
  toggleRepaired(
    inboundId: number,
    inspections: InboundRailcar[]
  ): void {
    const row = inspections.find(r => r.inboundId === inboundId);
    if (row && !row.isRepaired) {
      row.repairDescription = '';
    }
  }

  toggleBadOrder(inboundId: number, inspections: InboundRailcar[]): void {
    const row = inspections.find(r => r.inboundId === inboundId);
    if (row) {
      row.badOrdered = !row.badOrdered;
      if (row.badOrdered) {
        if (!row.badOrderedRailcar) {
          row.badOrderedRailcar = {
            badOrderId: 0,
            inboundId: row.inboundId,
            carMark: row.carMark,
            carNumber: row.carNumber,
            badOrderDate: new Date().toISOString().split('T')[0],
            badOrderDescription: '',
            isActive: true,
            repairedDate: undefined
          };
        }
      } else {
        row.badOrderedRailcar = undefined;
      }
    }
  }

  toggleLoadStatus(row: InboundRailcar): void {
    row.isEmpty = !row.isEmpty;
  }

  // --- Select All (InboundRailcar only) ---
  toggleSelectAll(
    pagedData: InboundRailcar[] | BadOrderedRailcar[],
    selectedRows: Set<number>
  ): void {
    const updatedSelected = new Set(selectedRows);
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      pagedData.forEach(row => updatedSelected.add(row.inboundId));
    } else {
      pagedData.forEach(row => updatedSelected.delete(row.inboundId));
    }
    this.selectedRows = updatedSelected;
  }

  // --- Toggle Select (InboundRailcar only) ---
  toggleSelect(
    inboundId: number,
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>
  ): void {
    if (selectedRows.has(inboundId)) {
      this.cancelEdit(inboundId, inspections, selectedRows, rowBackups, { new: [], modified: [] });
    } else {
      if (inboundId > 0) {
        const row = inspections.find(r => r.inboundId === inboundId);
        if (row) {
          const updatedBackups = new Map(rowBackups);
          updatedBackups.set(inboundId, { ...row });
          this.rowBackups = updatedBackups;
        }
      }
      const updatedSelected = new Set(selectedRows);
      updatedSelected.add(inboundId);
      this.selectedRows = updatedSelected;
    }
  }

  // --- Add New Row (InboundRailcar only) ---
  private generateRowId(): number {
    return -(Date.now() + Math.floor(Math.random() * 1000));
  }

  addNewRow(
    inspections: InboundRailcar[],
    selectedRows: Set<number>
  ): void {
    const emptyRow: InboundRailcar = {
      inboundId: this.generateRowId(),
      carMark: '',
      carNumber: '',
      isRepaired: false,
      repairDescription: '',
      isEmpty: true,
      inspectedDate: new Date().toISOString().split('T')[0],
      badOrdered: false,
      badOrderedRailcar: undefined
    };
    inspections.unshift(emptyRow);
    const updatedSelected = new Set(selectedRows);
    updatedSelected.add(emptyRow.inboundId!);
    this.selectedRows = updatedSelected;
    this.inspections = inspections;
  }

  // --- Submit Inspections (InboundRailcar only) ---
  submitInspections(
    queue: InspectionQueue,
    selectedRows: Set<number>
  ): Observable<InboundRailcar[]> {
    if (queue.new.length === 0 && queue.modified.length === 0) {
      this.toast.show('No changes to submit', 'error');
      return EMPTY;
    }
    const allChanges = [...queue.new, ...queue.modified] as InboundRailcar[];
    this.loading = true;
    return (this.inboundService.addInspections(allChanges) as Observable<InboundRailcar[]>)
      .pipe(finalize(() => this.loading = false));
  }

  // --- Delete Inspections (InboundRailcar only) ---
  deleteInspections(
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue
  ): Observable<InboundRailcar[]> {
    if (selectedRows.size === 0) {
      this.toast.show('No selected rows to delete.', 'error');
      return of([]);
    }

    const selectedRowsArray = this.getSelectedRows(inspections, selectedRows);
    const toDeleteFromBackend = selectedRowsArray.filter(row => row.inboundId! > 0);
    const toDeleteLocally = selectedRowsArray.filter(row => row.inboundId! < 0);

    const backendIds = toDeleteFromBackend.map(row => row.inboundId!);

    this.deleteLocalRows(toDeleteLocally, inspections, selectedRows, rowBackups);

    if (backendIds.length > 0) {
      return this.inboundService.deleteInspections(backendIds).pipe(
        map(() => selectedRowsArray)
      );
    } else {
      return of(selectedRowsArray);
    }
  }

  private getSelectedRows(
    inspections: InboundRailcar[],
    selectedRows: Set<number>
  ): InboundRailcar[] {
    return Array.from(selectedRows)
      .map(id => inspections.find(row => row.inboundId === id))
      .filter((row): row is InboundRailcar => row !== undefined);
  }

  private deleteLocalRows(
    rows: InboundRailcar[],
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>
  ): void {
    rows.forEach(row => {
      const idx = inspections.findIndex(r => r.inboundId === row.inboundId);
      if (idx !== -1) inspections.splice(idx, 1);

      // Update selectedRows and rowBackups
      const updatedSelected = new Set(this.selectedRows);
      updatedSelected.delete(row.inboundId!);
      this.selectedRows = updatedSelected;

      const updatedBackups = new Map(this.rowBackups);
      updatedBackups.delete(row.inboundId!);
      this.rowBackups = updatedBackups;
    });
  }

  // --- Handle Delete Success (InboundRailcar only) ---
  handleDeleteSuccess(
    deletedRows: InboundRailcar[],
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue,
    onSuccess?: () => void
  ): void {
    this.deletedRows = deletedRows;
    const deletedIds = deletedRows.map(row => row.inboundId);
    for (const id of deletedIds) {
      const idx = inspections.findIndex(row => row.inboundId === id);
      if (idx !== -1) inspections.splice(idx, 1);
      const updatedSelected = new Set(selectedRows);
      updatedSelected.delete(id!);
      this.selectedRows = updatedSelected;
      const updatedBackups = new Map(rowBackups);
      updatedBackups.delete(id!);
      this.rowBackups = updatedBackups;
    }
    queue.new = queue.new.filter(row => !deletedIds.includes(row.inboundId));
    queue.modified = queue.modified.filter(row => !deletedIds.includes(row.inboundId));
    this.selectAll = false;
    this.updateEditMode(this.selectedRows, queue);
    this.loading = false;
    if (onSuccess) onSuccess();
    this.toast.show(`Successfully deleted ${deletedRows.length} inspections`, 'success');
    console.log(`Successfully deleted ${deletedRows.length} inspections`);
  }
}