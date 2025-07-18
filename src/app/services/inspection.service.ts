import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { InboundRailcar, BadOrderedRailcar } from '../components/railcar-inspection/models/inspections';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getInspections(): Observable<InboundRailcar[]> {
    return this.http.get<InboundRailcar[]>(this.baseUrl + '/inspections');
  }
  
  addInspections(data: InboundRailcar | InboundRailcar[]): Observable<InboundRailcar | InboundRailcar[]> {
    return this.http.post<InboundRailcar | InboundRailcar[]>(`${this.baseUrl}/inspections`, data);
  }

  updateInspection(id: string, data: InboundRailcar): Observable<InboundRailcar> {
    return this.http.put<InboundRailcar>(`${this.baseUrl}/inspections/${id}`, data);
  }

  deleteInspection(id: string, data: InboundRailcar | InboundRailcar[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/inspections/${id}`);
  }

  getBadOrders(): Observable<BadOrderedRailcar[]> {
    return this.http.get<BadOrderedRailcar[]>(`${this.baseUrl}/bad-orders`);
  }

  getAllBadOrders(): Observable<BadOrderedRailcar[]> {
    return this.http.get<BadOrderedRailcar[]>(`${this.baseUrl}/bad-orders/all`);
  }

  updateBadOrder(id: string, data: BadOrderedRailcar): Observable<BadOrderedRailcar> {
    return this.http.put<BadOrderedRailcar>(`${this.baseUrl}/bad-orders/${id}`, data);
  }

}
