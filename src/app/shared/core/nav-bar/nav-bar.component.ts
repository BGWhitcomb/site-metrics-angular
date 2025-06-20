import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  template: `<aside *ngIf="isLoggedIn" class="sidebar">
  <div class="sidebar-logo">
    <img href="/home" alt="Railcar App Logo" src="/assets/railcartracker_grey.png" />
  </div>
  <nav class="nav flex-column sidebar-nav w-100 align-items-center">
    <a class="nav-link tooltip-custom" [ngClass]="{'active': activeTab === 'home'}" routerLink="/home" routerLinkActive="active"
      [attr.aria-selected]="activeTab === 'home'">
      <span class="material-icons-outlined sidebar-icon">home</span>
      <span class="tooltiptext-custom">Home</span>
    </a>
    <a class="nav-link tooltip-custom position-relative" [ngClass]="{'active': activeTab === 'railcarForm'}"
      routerLink="/railcar-form" routerLinkActive="active" [attr.aria-selected]="activeTab === 'railcarForm'">
      <span class="material-icons sidebar-icon">train</span>
      <span class="material-icons-outlined sidebar-add-icon">add_circle</span>
      <span class="tooltiptext-custom">Add New Inspection</span>
    </a>
    <a class="nav-link tooltip-custom" [ngClass]="{'active': activeTab === 'inspectionList'}"
      routerLink="/railcar-inspection-list" routerLinkActive="active"
      [attr.aria-selected]="activeTab === 'inspectionList'">
      <span class="material-icons-outlined sidebar-icon">list_alt</span>
      <span class="tooltiptext-custom">Inspection List</span>
    </a>
  </nav>
  <div class="mt-auto d-flex flex-column align-items-center w-100" style="padding-bottom: 1.5rem;">
    <a class="nav-link active tooltip-custom" (click)="openLogoutModal()" style="cursor:pointer;">
      <span class="material-icons-outlined sidebar-icon">logout</span>
      <span class="tooltiptext-custom">Logout</span>
    </a>
  </div>
</aside>`
})
export class NavBarComponent {

  showLogoutModal: boolean = false;


  openLogoutModal() {
    this.showLogoutModal = true;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  activeTab: 'home' | 'railcarForm' | 'inspectionList' = 'home';

  setTab(tab: 'home' | 'railcarForm' | 'inspectionList') {
    this.activeTab = tab;
  }

}
