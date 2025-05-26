import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  showLogoutModal: boolean = false;


  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }


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

  activeTab: 'home' | 'railcarForm' | 'inspectionList'  = 'home';

  setTab(tab: 'home' | 'railcarForm' | 'inspectionList') {
    this.activeTab = tab;
  }


}