import { Component } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1200;">
      <div *ngFor="let t of toast.toasts$ | async" 
           class="toast fade show mb-2 shadow"
           role="alert"
           aria-live="assertive"
           aria-atomic="true"
           [ngClass]="{
             'bg-success text-white': t.type === 'success',
             'bg-danger text-white': t.type === 'error',
             'bg-info text-white': t.type === 'info',
           }">
        <div class="d-flex align-items-center">
          <div class="toast-body flex-grow-1">
            <span class="fw-semibold me-2" *ngIf="t.type === 'success'">✔</span>
            <span class="fw-semibold me-2" *ngIf="t.type === 'error'">⛔</span>
            <span class="fw-semibold me-2" *ngIf="t.type === 'info'">ℹ️</span>
            {{ t.message }}
          </div>
          <button *ngIf="t.id !== undefined" type="button" class="btn-close btn-close-white ms-2 m-2" aria-label="Close"
                  (click)="toast.remove(t.id)">
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  toasts$ = this.toast.toasts$;
  constructor(public toast: ToastService) { }
}
