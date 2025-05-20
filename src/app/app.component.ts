import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  constructor(private router: Router) { }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    }
  }

}