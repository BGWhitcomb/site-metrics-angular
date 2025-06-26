import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './app/components/home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { RailcarFormComponent } from './app/components/railcar-inspection/railcar-form/railcar-form.component';
import { RailcarInspectionListComponent } from './app/components/railcar-inspection/container/railcar-inspection-list/railcar-inspection-list.component';
import { LoginComponent } from './app/auth/login/login.component';

import { AuthGuard } from './app/auth/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'railcar-form', component: RailcarFormComponent, canActivate: [AuthGuard] },
  { path: 'railcar-inspection-list', component: RailcarInspectionListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]

})
export class AppRoutingModule { }
