import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RailcarFormComponent } from './components/railcar-inspection/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './components/railcar-inspection/railcar-inspection-list/railcar-inspection-list.component';
import { BadOrderListComponent } from './components/railcar-inspection/bad-order-list/bad-order-list.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
