import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Auth0 observables
  isAuthenticated$: Observable<boolean> = this.auth0.isAuthenticated$;
  user$ = this.auth0.user$;
  accessToken$ = this.auth0.getAccessTokenSilently();

  constructor(private auth0: Auth0Service) { }

  login(redirectPath: string = '/') {
    this.auth0.loginWithRedirect({ appState: { target: redirectPath } });
  }

  logout() {
    this.auth0.logout();
  }
}