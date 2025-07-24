import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BadOrderedRailcar } from '../components/railcar-inspection/models/inspections';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BadOrderedRailcarService {

  private baseUrl = environment.apiUrl.find(url => url.includes('localhost')) || environment.apiUrl[0];

  constructor(private http: HttpClient) { }

  // isActive bad orders
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
