import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InboundRailcar } from '../railcar-inspection/models/inspections';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // use inspection service for ssot
  private inspectionService = this.http;

  // Get all inspections for charts
  getAllInspections(): Observable<InboundRailcar[]> {
    return this.inspectionService.get<InboundRailcar[]>(`${this.baseUrl}/inspections`);
  }
}