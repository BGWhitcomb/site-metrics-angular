import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.css']
})
export class LogoutDialogComponent {
  @Input() isVisible: boolean = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  confirmLogout(): void {
    this.confirm.emit();
  }

  cancelLogout(): void {
    this.close.emit();
  }
}
