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

  // Get all inspections for charts
  getAllInspections(): Observable<InboundRailcar[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inspections`);
  }

  // // Get inspection summary/stats
  // getInspectionStats(): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/inspections/stats`);
  // }

  // // Get inspections by date range for trending
  // getInspectionsByDateRange(startDate: string, endDate: string): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/inspections/date-range?start=${startDate}&end=${endDate}`);
  // }

  // // Get recent inspections
  // getRecentInspections(limit: number = 10): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/inspections/recent?limit=${limit}`);
  // }

  // // Get inspections grouped by status for pie charts
  // getInspectionsByStatus(): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/inspections/by-status`);
  // }
}