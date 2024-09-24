import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RailcarFormComponent } from './railcar/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './railcar/railcar-inspection-list/railcar-inspection-list.component';
import { BadOrderListComponent } from './railcar/bad-order-list/bad-order-list.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';

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
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
