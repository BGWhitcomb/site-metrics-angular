import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InspectionQueue } from '../../../models/inspection-queue';
import { RowEditingService } from '../../../data-grid/services/row-editing.service';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.css']
})
export class ActionBarComponent {


  @Input() selectedRows = new Set<number>();
  @Input() queue: InspectionQueue = { new: [], modified: [] };

  @Output() cancelAllEdits = new EventEmitter<void>();
  @Output() saveSelectedRows = new EventEmitter<void>();
  @Output() deleteSelectedRows = new EventEmitter<void>();
  @Output() submitInspections = new EventEmitter<void>();
  constructor(public edit: RowEditingService) { }

  onCancelAllEdits(): void {
    this.cancelAllEdits.emit();
  }
  onSaveSelectedRows(): void {
    this.saveSelectedRows.emit();
  }
  onDeleteSelectedRows(): void {
    this.deleteSelectedRows.emit();
  }
  onSubmitInspections(): void {
    this.submitInspections.emit();
  }

}
