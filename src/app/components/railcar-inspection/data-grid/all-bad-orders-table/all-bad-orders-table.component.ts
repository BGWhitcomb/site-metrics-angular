import { Component, Input } from '@angular/core';
import { BadOrderedRailcar } from '../../models/bad-ordered-railcar';
import { PaginationService } from '../services/pagination.service';

@Component({
  selector: 'app-all-bad-orders-table',
  templateUrl: './all-bad-orders-table.component.html',
  styleUrls: ['./all-bad-orders-table.component.css'],
  providers: [PaginationService]
})
export class AllBadOrdersTableComponent {

  @Input() allBadOrders: BadOrderedRailcar[] = [];

  Math = Math;

  constructor(public pagination: PaginationService<BadOrderedRailcar>) { }

  get pagedData(): BadOrderedRailcar[] {
    return this.pagination.getPagedData(this.allBadOrders);
  }

  get page(): number {
    return this.pagination.page;
  }

  get pageSize(): number {
    return this.pagination.pageSize;
  }

  get sortColumn(): string {
    return this.pagination.sortColumn;
  }

  get sortDirection(): 'asc' | 'desc' {
    return this.pagination.sortDirection;
  }

  setSort(column: string) {
    this.pagination.setSort(column);
  }

  setPage(page: number) {
    this.pagination.setPage(page, this.allBadOrders);
  }
}