import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './app/home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { RailcarFormComponent } from './app/railcar/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './app/railcar/railcar-inspection-list/railcar-inspection-list.component';
import { BadOrderListComponent } from './app/railcar/bad-order-list/bad-order-list.component';
import { LoginComponent } from './app/auth/login/login.component';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'railcar-form', component: RailcarFormComponent, canActivate: [AuthGuard] },
  { path: 'railcar-inspection-list', component: RailcarInspectionListComponent, canActivate: [AuthGuard] },
  { path: 'bad-order-list', component: BadOrderListComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]

})
export class AppRoutingModule { }
