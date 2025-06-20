import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div *ngIf="loading" class="loading-overlay d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ message }}</span>
      </div>
      <div class="loading-message mt-2">{{ message }}</div>
    </div>
  `
})
export class LoadingComponent {
  @Input() loading: boolean = false;
  @Input() message: string = 'Loading...';

  get isloading(): boolean {
    return this.loading;
  }
  get loadingMessage(): string {
    return this.message;
  }
  set isloading(value: boolean) {
    this.loading = value;
  }
}