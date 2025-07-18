

export interface Pagination<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalPages: number;
    sortColumn: string;
    sortDirection: 'asc' | 'desc' | '';
    showingFrom: number;
    showingTo: number;
}
