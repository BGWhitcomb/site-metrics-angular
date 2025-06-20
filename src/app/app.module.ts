import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RailcarFormComponent } from './components/railcar-inspection/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './components/railcar-inspection/container/railcar-inspection-list/railcar-inspection-list.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { PaginationComponent } from './components/railcar-inspection/data-grid/pagination/pagination.component';
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

@NgModule({
  declarations: [
    AppComponent,
    RailcarFormComponent,
    RailcarInspectionListComponent,
    LoginComponent,
    HomeComponent,
    PaginationComponent,
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
    ActionBarComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
