import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RailcarFormComponent } from './railcar/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './railcar/railcar-inspection-list/railcar-inspection-list.component';
import { BadOrderListComponent } from './railcar/bad-order-list/bad-order-list.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    RailcarFormComponent,
    RailcarInspectionListComponent,
    BadOrderListComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent] // Only the root component should be here
})
export class AppModule { }