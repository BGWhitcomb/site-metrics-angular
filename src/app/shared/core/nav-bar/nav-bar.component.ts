import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  showLogoutModal = false;

  constructor(private auth: AuthService) { }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;
    this.auth.logout();
  }

  activeTab: 'home' | 'railcarForm' | 'inspectionList' = 'home';

  setTab(tab: 'home' | 'railcarForm' | 'inspectionList') {
    this.activeTab = tab;
  }
}