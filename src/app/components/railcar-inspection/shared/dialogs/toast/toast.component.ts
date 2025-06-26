import { Component } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';


@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1200;">
      <div *ngFor="let t of toast.toasts$ | async" class="toast show mb-2"
           [ngClass]="{
             'bg-success text-white': t.type === 'success',
             'bg-danger text-white': t.type === 'error',
              'bg-info text-white': t.type === 'info'
           }">
        <div class="toast-body">
          {{ t.message }}
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  toasts$ = this.toast.toasts$;
  constructor(public toast: ToastService) { }

}
