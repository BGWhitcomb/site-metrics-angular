import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { BadOrderedRailcar } from '../../models/inspections';
import { RowEditingService } from './row-editing.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  badOrders: BadOrderedRailcar[] = [];

  constructor(private edit: RowEditingService) {
  }
  /**
   * Exports the currently active bad orders to an Excel file.
   * If there are no active bad orders, it logs a warning and does not proceed with export.
   * The exported file will have a timestamp in its name.
   */

  exportBadOrders(_badOrders: BadOrderedRailcar[]): void {
    // call editing service to get the latest bad orders
    this.badOrders = this.edit.badOrders;
    if (this.edit.badOrders.length === 0) {
      console.warn('No active bad orders to export.');
      return;
    }


    // Prepare data for export
    const exportData = this.badOrders.map(_bo => ({
      'Car Mark': _bo.carMark,
      'Car Number': _bo.carNumber,
      'Bad Order Description': _bo.badOrderDescription,
      'Bad Order Date': _bo.badOrderDate ? new Date(_bo.badOrderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) : '',
    }));

    // Create workbook and worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = this.calculateColumnWidths(exportData);
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Active Bad Orders');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `active-bad-orders-${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  }

  private calculateColumnWidths(data: any[]): any[] {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map(key => {
      // Removed unused formatDate method
      return { wch: Math.min(key.length + 2, 50) }; // Cap at 50 characters
    });
  }
}
