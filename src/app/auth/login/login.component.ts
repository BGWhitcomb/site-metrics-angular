import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  // Mock authentication service
  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    if (this.username === 'admin' && this.password === 'password') {
      localStorage.setItem('token', 'mock-token');
      this.errorMessage = '';
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
    // Placeholder for actual authentication logic
    // This should be replaced with a real API call
    this.http.post('/api/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        // Store token (mock)
        localStorage.setItem('token', res.token);
        this.errorMessage = '';
        // Redirect or update UI as needed
      },
      error: () => {
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}