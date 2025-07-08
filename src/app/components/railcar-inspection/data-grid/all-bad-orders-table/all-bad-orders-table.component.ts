import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadOrderedRailcar } from '../../models/inspections';
import { PaginationService } from '../services/pagination.service';
import { RowEditingService } from '../services/row-editing.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-all-bad-orders-table',
  templateUrl: './all-bad-orders-table.component.html',
  styleUrls: ['./all-bad-orders-table.component.css'],
  providers: [PaginationService]
})
export class AllBadOrdersTableComponent {

  @Input() pagedAllBadOrders$!: Observable<BadOrderedRailcar[]>;
  @Input() allBadOrders: BadOrderedRailcar[] = [];
  @Input() showingTo!: number;
  @Input() showingFrom!: number;
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' | '' = 'asc';


  @Output() setSort = new EventEmitter<string>();
  @Output() setPage = new EventEmitter<number>();
  Math = Math;

  constructor(public edit: RowEditingService) { }

  onSetSort(column: string): void {
    this.setSort.emit(column);
  }

  onSetPage(page: number): void {
    this.setPage.emit(page);
  }

  onViewDetails(row: BadOrderedRailcar): void {
    this.showModal({
      title: 'Bad Order Details',
      content: `
        <p><strong>Railcar ID:</strong> ${row.inboundId}</p>
        <p><strong>Bad Order ID:</strong> ${row.badOrderId}</p>
        <p><strong>Bad Order Date:</strong> ${row.badOrderDate}</p>
        <p><strong>Repair Date:</strong> ${row.repairedDate || 'N/A'}</p>
        <p><strong>Description:</strong> ${row.badOrderDescription || 'N/A'}</p>
      `,
      buttons: [
        {
          text: 'Close',
          action: () => {
            this.closeModal();
          }
        }
      ]
    });
  }

  showModal(options: { title: string, content: string, buttons: { text: string, action: () => void }[] }): void {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${options.title}</h2>
        <div>${options.content}</div>
        <div class="modal-buttons">
          ${options.buttons.map(button => `<button class="btn">${button.text}</button>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const buttons = modal.querySelectorAll('.btn');
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        options.buttons[index].action();
        document.body.removeChild(modal);
      });
    });
  }

  closeModal(): void {
    const modal = document.querySelector('.modal');
    if (modal) {
      document.body.removeChild(modal);
    }
  }
}