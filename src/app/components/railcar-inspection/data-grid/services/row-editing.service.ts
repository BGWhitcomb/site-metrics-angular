import { Injectable } from '@angular/core';
import { InboundRailcar } from '../../models/inbound-railcar';
import { InspectionQueue } from '../../models/inspection-queue';
import { ToastService } from 'src/app/services/toast.service';
import { EMPTY, finalize, forkJoin, map, Observable, of } from 'rxjs';
import { InspectionService } from 'src/app/services/inspection.service';
import { BadOrderedRailcar } from '../../models/bad-ordered-railcar';

@Injectable({
  providedIn: 'root'
})
export class RowEditingService {

  selectAll = false;
  loading = false;

  constructor(private toast: ToastService, private inspectionService: InspectionService) { }

  isEditing(selectedRows: Set<number>, inboundId: number): boolean {
    return selectedRows.has(inboundId);
  }

  selectRow(
    inboundId: number,
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>
  ): void {
    if (!selectedRows.has(inboundId)) {
      selectedRows.add(inboundId);
      const row = inspections.find(r => r.inboundId === inboundId);
      if (row && !rowBackups.has(inboundId)) {
        rowBackups.set(inboundId, { ...row });
      }
    }
  }

  deselectRow(
    inboundId: number,
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>
  ): void {
    if (selectedRows.has(inboundId)) {
      const backup = rowBackups.get(inboundId);
      if (backup) {
        const idx = inspections.findIndex(r => r.inboundId === inboundId);
        if (idx !== -1) inspections[idx] = { ...backup };
        rowBackups.delete(inboundId);
      }
      selectedRows.delete(inboundId);
    }
  }

  cancelEdit(
    inboundId: number,
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue
  ): void {
    if (inboundId < 0) {
      const idx = inspections.findIndex(row => row.inboundId === inboundId);
      if (idx !== -1) inspections.splice(idx, 1);
      selectedRows.delete(inboundId);
      this.updateEditMode(selectedRows, queue);
    } else {
      if (rowBackups.has(inboundId)) {
        const rowIndex = inspections.findIndex(row => row.inboundId === inboundId);
        if (rowIndex !== -1) {
          inspections[rowIndex] = { ...rowBackups.get(inboundId)! };
        }
        rowBackups.delete(inboundId);
        selectedRows.delete(inboundId);
        this.updateEditMode(selectedRows, queue);
      }
    }
  }

  cancelAllEdits(
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue
  ): void {
    const idsToCancel = Array.from(selectedRows);
    idsToCancel.forEach((inboundId) =>
      this.cancelEdit(inboundId, inspections, selectedRows, rowBackups, queue)
    );
    queue.new = [];
    queue.modified = [];
    selectedRows.clear();
    this.updateEditMode(selectedRows, queue);
  }

  resolveBadOrder(row: InboundRailcar, newDate: string): Observable<InboundRailcar> {
    if (!row.badOrderedRailcar) {
      row.badOrderedRailcar = {} as BadOrderedRailcar;
    }
    row.badOrderedRailcar.repairedDate = newDate;
    row.badOrderedRailcar.isActive = false;

    return this.inspectionService.updateInspection(row.inboundId!.toString(), row)
  }

  updateBadOrderDate(row: InboundRailcar, newDate: string): void {
    if (!row.badOrderedRailcar) {
      row.badOrderedRailcar = {} as BadOrderedRailcar;
    }
    row.badOrderedRailcar.badOrderDate = newDate;
  }

  updateBadOrderDescription(row: InboundRailcar, newDescription: string): void {
    if (!row.badOrderedRailcar) {
      row.badOrderedRailcar = {} as BadOrderedRailcar;
    }
    row.badOrderedRailcar.badOrderDescription = newDescription;
  }

  private updateEditMode(selectedRows: Set<number>, queue: InspectionQueue): void {
    if (selectedRows.size === 0) {
      this.selectAll = false;
    }
    if (selectedRows.size === 0 && queue.new.length === 0 && queue.modified.length === 0) {
      queue.new = [];
      queue.modified = [];
    }
  }

  private validateRow(row: InboundRailcar): boolean {
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
  }

  // removed this button to use the action bar instead - save selected
  saveIndividualRow(
    inboundId: number,
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue
  ): void {
    const row = inspections.find(r => r.inboundId === inboundId);
    if (row && this.validateRow(row)) {
      if (inboundId < 0) {
        queue.new.push({ ...row });
      } else {
        queue.modified.push({ ...row });
      }
      rowBackups.delete(inboundId);
      selectedRows.delete(inboundId);
      this.updateEditMode(selectedRows, queue);
      this.toast.show(`Rows Saved. Click Submit to save to server.`, 'success');
    } else {
      this.toast.show('Please fill in all required fields', 'error');
    }
  }

  saveSelectedRows(
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue
  ): void {
    let validRowCount = 0;
    const totalSelectedRows = selectedRows.size;
    Array.from(selectedRows).forEach(inboundId => {
      const row = inspections.find(r => r.inboundId === inboundId);
      if (row && this.validateRow(row)) {
        validRowCount++;
        if (inboundId < 0) {
          queue.new.push({ ...row });
        } else {
          queue.modified.push({ ...row });
        }
        rowBackups.delete(inboundId);
      }
    });
    if (validRowCount === totalSelectedRows && totalSelectedRows > 0) {
      selectedRows.clear();
      this.toast.show('Changes stored. Click Submit to save.', 'success');
    } else if (totalSelectedRows > 0) {
      this.toast.show('Please fill in all required fields', 'error');
    }
  }

  toggleRepaired(
    inboundId: number,
    inspections: InboundRailcar[]
  ): void {
    const row = inspections.find(r => r.inboundId === inboundId);
    if (row && !row.isRepaired) {
      row.repairDescription = '';
    }
  }

  toggleBadOrder(
    inboundId: number,
    inspections: InboundRailcar[]
  ): void {
    const row = inspections.find(r => r.inboundId === inboundId);
    if (row) {
      if (row.badOrdered) {
        if (!row.badOrderedRailcar) {
          row.badOrderedRailcar = {
            badOrderId: 0,
            carMark: row.carMark || '',
            carNumber: parseInt(row.carNumber?.toString() || '0'),
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

  toggleSelectAll(
    pagedData: InboundRailcar[],
    selectedRows: Set<number>
  ): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      pagedData.forEach(row => selectedRows.add(row.inboundId));
    } else {
      pagedData.forEach(row => selectedRows.delete(row.inboundId));
    }
  }

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
          rowBackups.set(inboundId, { ...row });
        }
      }
      selectedRows.add(inboundId);
    }
  }

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
    selectedRows.add(emptyRow.inboundId!);
  }

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
    return (this.inspectionService.addInspections(allChanges) as Observable<InboundRailcar[]>)
      .pipe(finalize(() => this.loading = false));
  }

  deleteInspections(
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue
  ): Observable<void> | void {
    if (selectedRows.size === 0) {
      this.toast.show('No selected rows to delete.', 'error');
      return of();
    }
    const selectedRowsArray = Array.from(selectedRows)
      .map(id => inspections.find(row => row.inboundId === id))
      .filter(row => row !== undefined) as InboundRailcar[];
    const toDeleteFromBackend = selectedRowsArray.filter(row => row.inboundId! > 0);
    const toDeleteLocally = selectedRowsArray.filter(row => row.inboundId! < 0);

    const deleteObservables: Observable<void>[] = [];
    if (toDeleteFromBackend.length > 0) {
      toDeleteFromBackend.forEach(row => {
        deleteObservables.push(
          this.inspectionService.deleteInspection(row.inboundId!.toString(), row)
        );
      });
    }
    if (toDeleteLocally.length > 0) {
      toDeleteLocally.forEach(row => {
        const idx = inspections.findIndex(r => r.inboundId === row.inboundId);
        if (idx !== -1) inspections.splice(idx, 1);
        selectedRows.delete(row.inboundId!);
        rowBackups.delete(row.inboundId!);
      });
    }

    if (deleteObservables.length > 0) {
      return forkJoin(deleteObservables).pipe(
        map(() => void 0)
      );
    } else {

      return of();
    }
  }

  handleDeleteSuccess(
    deletedRows: InboundRailcar[],
    inspections: InboundRailcar[],
    selectedRows: Set<number>,
    rowBackups: Map<number, InboundRailcar>,
    queue: InspectionQueue,
    onSuccess?: () => void
  ): void {
    const deletedIds = deletedRows.map(row => row.inboundId);
    for (const id of deletedIds) {
      const idx = inspections.findIndex(row => row.inboundId === id);
      if (idx !== -1) inspections.splice(idx, 1);
      selectedRows.delete(id!);
      rowBackups.delete(id!);
    }
    queue.new = queue.new.filter(row => !deletedIds.includes(row.inboundId));
    queue.modified = queue.modified.filter(row => !deletedIds.includes(row.inboundId));
    this.selectAll = false;
    this.updateEditMode(selectedRows, queue);
    this.loading = false;
    if (onSuccess) onSuccess();
    this.toast.show(`Successfully deleted ${deletedRows.length} inspections`, 'success');
    console.log(`Successfully deleted ${deletedRows.length} inspections`);
  }
}