import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InboundRailcar } from '../components/railcar-inspection/models/inspections';

@Injectable({
  providedIn: 'root'
})
export class InboundRailcarService {

  private baseUrl = environment.apiUrl.find(url => url.includes('localhost')) || environment.apiUrl[0];

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

  deleteInspections(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', `${this.baseUrl}/inspections`, {
      body: ids
    });
  }

}
