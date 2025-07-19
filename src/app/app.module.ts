import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';

import { AppComponent } from './app.component';
import { RailcarFormComponent } from './components/railcar-inspection/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './components/railcar-inspection/container/railcar-inspection-list/railcar-inspection-list.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { InspectionTableComponent } from './components/railcar-inspection/data-grid/inspection-table/inspection-table.component';
import { FilterComponent } from './components/railcar-inspection/data-grid/filter/filter.component';
import { BadOrderTableComponent } from './components/railcar-inspection/data-grid/bad-order-table/bad-order-table.component';
import { AllBadOrdersTableComponent } from './components/railcar-inspection/data-grid/all-bad-orders-table/all-bad-orders-table.component';
import { ConfirmationDialogComponent } from './components/railcar-inspection/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ToastComponent } from './components/railcar-inspection/shared/dialogs/toast/toast.component';
import { NavBarComponent } from './shared/core/nav-bar/nav-bar.component';
import { LogoutDialogComponent } from './shared/core/logout-dialog/logout-dialog.component';
import { FooterComponent } from './shared/core/footer/footer.component';
import { LoadingComponent } from './shared/core/loading/loading.component';
import { ActionBarComponent } from './components/railcar-inspection/shared/action-buttons/action-bar/action-bar.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { CallbackComponent } from './auth/callback/callback.component';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    RailcarFormComponent,
    RailcarInspectionListComponent,
    LoginComponent,
    HomeComponent,
    InspectionTableComponent,
    FilterComponent,
    BadOrderTableComponent,
    AllBadOrdersTableComponent,
    ConfirmationDialogComponent,
    ToastComponent,
    NavBarComponent,
    LogoutDialogComponent,
    FooterComponent,
    LoadingComponent,
    ActionBarComponent,
    CallbackComponent
  ],

  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    AuthModule.forRoot({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId,
      useRefreshTokens: true,
      cacheLocation: 'localstorage', // Use local storage for testing purposes
      // cacheLocation: 'memory', // Use memory for production
      authorizationParams: {
        redirect_uri: environment.auth.redirectUri,
        logoutUrl: environment.auth.logoutUrl,
        audience: environment.auth.audience,
        returnTo: environment.auth.returnTo,
        scope: 'openid profile email'
      }
    }),
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
