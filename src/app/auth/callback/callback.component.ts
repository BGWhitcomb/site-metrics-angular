import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent {
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.isAuthenticated$
      .pipe(take(1))
      .subscribe({
        next: loggedIn => {
          if (loggedIn) {
            this.router.navigate(['/home']);
          } else {
            this.error = 'Authentication failed. Please try again.';
          }
        },
        error: err => {
          this.error = 'An error occurred during authentication.';
        }
      });
  }
}
