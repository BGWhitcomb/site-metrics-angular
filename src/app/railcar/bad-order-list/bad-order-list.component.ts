import { Component, Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { BadOrderedRailcar } from '../bad-ordered-railcar';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-bad-order-list',
  templateUrl: './bad-order-list.component.html',
  styleUrls: ['./bad-order-list.component.css']
})
export class BadOrderListComponent {
  badOrders: BadOrderedRailcar[] = [];

  constructor() {
    // Initialize with sample data for testing
    this.loadBadOrders();
  }

  private loadBadOrders(): BadOrderedRailcar[] {
    // Replace this with actual data loading logic
    // For now, return an empty array or sample data
    return [];
  }

  getActiveBadOrders(): BadOrderedRailcar[] {
    return this.badOrders.filter(bo =>
      bo.isActive &&
      new Date(bo.orderDate) >= new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
    );
  }

  exportToExcel(): void {
    const activeBadOrders = this.getActiveBadOrders();

    if (activeBadOrders.length === 0) {
      alert('No active bad orders to export.');
      return;
    }

    // Prepare data for export
    const exportData = activeBadOrders.map(bo => ({

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
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key]).length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  refreshBadOrders(): void {
    this.loadBadOrders();
  }

  getActiveBadOrderCount(): number {
    return this.getActiveBadOrders().length;
  }
}