import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `<footer *ngIf="isLoggedIn === false" class="footer">
  <p>&copy; 2025 Railcar Tracker. All rights reserved.</p>
  <p>Contact: support&#64;railcartracker.site</p>
</footer>`
})
export class FooterComponent {

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

}
