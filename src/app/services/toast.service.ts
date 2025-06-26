import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../shared/models/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();

  show(message: string, type: 'success' | 'error' | 'info'): void {
    const toast: Toast = {
      message,
      type,
      id: Date.now()
    };

    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.remove(toast.id!);
    }, 3000);
  }

  private remove(id: number): void {
    const currentToasts = this.toasts.value;
    this.toasts.next(currentToasts.filter(t => t.id !== id));
  }
}
