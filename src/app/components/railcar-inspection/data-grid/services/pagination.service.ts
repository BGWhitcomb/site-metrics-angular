import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';

type SortDirection = 'asc' | 'desc' | '';

@Injectable()
export class PaginationService<T> {
  private _data$ = new BehaviorSubject<T[]>([]);
  private _page$ = new BehaviorSubject(1);
  private _pageSize$ = new BehaviorSubject(50);
  private _sortColumn$ = new BehaviorSubject<string>('');
  private _sortDirection$ = new BehaviorSubject<SortDirection>('asc');

  readonly pagedState$: Observable<Pagination<T>> = combineLatest([
    this._data$,
    this._page$,
    this._pageSize$,
    this._sortColumn$,
    this._sortDirection$
  ]).pipe(
    map(([data, page, pageSize, sortColumn, sortDirection]) => {
      const sortedData = sortColumn ? this.sortData([...data], sortColumn, sortDirection) : data;
      const start = (page - 1) * pageSize;
      const paged = sortedData.slice(start, start + pageSize);
      const totalPages = Math.ceil(data.length / pageSize);

      return {
        data: paged,
        page,
        pageSize,
        totalPages,
        sortColumn,
        sortDirection,
        showingFrom: start + 1,
        showingTo: Math.min(start + pageSize, data.length)
      };
    })
  );

  setData(data: T[]) {
    this._data$.next(data);
  }

  setPage(page: number) {
    const total = this.getTotalPages();
    if (page >= 1 && page <= total) this._page$.next(page);
  }

  setPageSize(size: number) {
    this._pageSize$.next(size);
    this.setPage(1);
  }

  setSort(column: string, direction?: SortDirection) {
    const currentColumn = this._sortColumn$.value;
    const currentDirection = this._sortDirection$.value;

    let newDirection: SortDirection = direction ?? (
      currentColumn !== column ? 'asc' :
      currentDirection === 'asc' ? 'desc' :
      currentDirection === 'desc' ? '' : 'asc'
    );

    this._sortColumn$.next(column);
    this._sortDirection$.next(newDirection);
    this._page$.next(1);
  }

  private getTotalPages(): number {
    return Math.ceil(this._data$.value.length / this._pageSize$.value);
  }

  private sortData(data: T[], column: string, direction: SortDirection): T[] {
    return data.sort((a, b) => {
      const aVal = a[column as keyof T];
      const bVal = b[column as keyof T];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle date fields
      if (column.toLowerCase().includes('date')) {
        const dateA = new Date(aVal as any).getTime();
        const dateB = new Date(bVal as any).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return aVal < bVal
        ? direction === 'asc' ? -1 : 1
        : aVal > bVal
          ? direction === 'asc' ? 1 : -1
          : 0;
    });
  }
}