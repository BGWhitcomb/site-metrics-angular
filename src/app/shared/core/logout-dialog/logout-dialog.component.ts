import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-dialog',
  template: `  <div class="modal" *ngIf="showLogoutModal">
    <div class="modal-content">
      <h3>Are you sure you want to logout?</h3>
      <button type="button" class="cta-button" (click)="confirmLogout()">Logout</button>
      <button type="button" class="cta-button" (click)="cancelLogout()">Cancel</button>
    </div>
  </div>`
})
export class LogoutDialogComponent {

  showLogoutModal: boolean = false;


  constructor(private router: Router) { }
  


  // Called when logout button is clicked
  openLogoutModal() {
    this.showLogoutModal = true;
  }

  // Called when user confirms logout in modal
  confirmLogout() {
    localStorage.removeItem('token');
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  // Called when user cancels logout in modal
  cancelLogout() {
    this.showLogoutModal = false;
  }

}
