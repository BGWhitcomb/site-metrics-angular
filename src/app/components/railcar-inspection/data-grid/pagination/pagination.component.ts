import { Component, Input } from '@angular/core';
import { InboundRailcar } from '../../models/inbound-railcar';
import { BadOrderedRailcar } from '../../models/bad-ordered-railcar';
import { ToastService } from 'src/app/services/toast.service';

type TabType = 'inspections' | 'bad-orders' | 'all-bad-orders';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  allBadOrders: BadOrderedRailcar[] = [];

  activeTab: TabType = 'inspections';

  constructor(toastService: ToastService) { }

  // Pagination & Sorting
  @Input() data: any[] = [];
  @Input() page = 1;
  @Input() pageSize = 50;
  @Input() sortColumn = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  get pagedData() {
    let data = this.sortColumn ? this.sortData(this.data) : this.data;
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  private sortData(data: any[]): any[] {
    return [...data].sort((a, b) => {
      const aValue = a[this.sortColumn as keyof any];
      const bValue = b[this.sortColumn as keyof any];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (this.sortColumn === 'inspectedDate') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return this.sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
    }
  }


}
