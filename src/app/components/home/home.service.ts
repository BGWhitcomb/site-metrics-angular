import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InboundRailcar } from '../railcar-inspection/models/inspections';
import { InboundRailcarService } from 'src/app/services/inbound-railcar.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(private inboundService: InboundRailcarService) { }

  getAllInspections(): Observable<InboundRailcar[]> {
    return this.inboundService.getInspections();
  }
}