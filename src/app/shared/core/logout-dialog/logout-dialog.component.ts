import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.css']
})
export class LogoutDialogComponent {
  @Input() isVisible: boolean = false;
  @Input() closeModal!: () => void;

  constructor(public auth: AuthService) { }

  confirmLogout(): void {
    this.auth.logout();
  }

  cancelLogout(): void {
    if (this.closeModal) {
      this.closeModal();
    }
  }
}
