import { Injectable } from '@angular/core';

@Injectable()
export class PaginationService<T> {
  page = 1;
  pageSize = 50;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = 'asc';

  getPagedData(data: T[]): T[] {
    let sorted = this.sortColumn ? this.sortData(data) : data;
    const start = (this.page - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  getTotalPages(data: T[]): number {
    return Math.ceil(data.length / this.pageSize);
  }

  setSort(column: string) {
    if (this.sortColumn !== column) {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    } else {
      if (this.sortDirection === '') {
        this.sortDirection = 'asc';
      } else if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = '';
      }
    }
    this.page = 1;
  }

  setPage(page: number, data: T[]) {
    const totalPages = this.getTotalPages(data);
    if (page >= 1 && page <= totalPages) {
      this.page = page;
    }
  }

  getShowingFrom(): number {
    return (this.page - 1) * this.pageSize + 1;
  }
  getShowingTo<T>(data: T[]): number {
    return Math.min(this.page * this.pageSize, data.length);
  }

  private sortData(data: T[]): T[] {
    return [...data].sort((a, b) => {
      const aValue = a[this.sortColumn as keyof T];
      const bValue = b[this.sortColumn as keyof T];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (this.sortColumn === 'inspectedDate') {
        const dateA = new Date(aValue as any);
        const dateB = new Date(bValue as any);
        return this.sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}