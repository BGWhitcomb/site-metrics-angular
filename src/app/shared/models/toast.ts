export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
    id?: number;
}
