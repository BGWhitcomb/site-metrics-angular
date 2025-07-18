import { Component } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public auth: AuthService, public router: Router) { }

  loading: boolean = false;
  isAuthenticated$ = this.auth.isAuthenticated$;

}