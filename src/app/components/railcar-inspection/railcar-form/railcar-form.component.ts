import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { InboundRailcar, BadOrderedRailcar } from '../models/inspections';

@Component({
  selector: 'app-railcar-form',
  templateUrl: './railcar-form.component.html',
  styleUrls: ['./railcar-form.component.css']
})
export class RailcarFormComponent implements OnInit, OnDestroy {
  carMark: string = '';
  carNumber: string = '';
  inspectedDate: string = '';
  isRepaired: boolean = false; // Used to show repair description field, and document if the railcar is repaired
  repairDescription: string = '';                                                   // at the time of inspection
  isLoaded: boolean = false; // Used for the checkbox in the UI
  isEmpty: boolean = false;  // Used only for backend logic
  badOrdered: boolean = false;
  badOrderDate: string = '';
  badOrderDescription: string = '';
  isActive: boolean = false; // Used to track if the bad order is active and not repaired
  showBadOrderModal: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  queuedRailcars: InboundRailcar[] = [];
  editIndex: number | null = null;
  loading: boolean = false;

  private messageTimeout: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.inspectedDate = today;
    this.badOrderDate = today;
  }

  ngOnDestroy(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  onRepairedChange(): void {
    if (!this.isRepaired) {
      this.repairDescription = '';
    }
  }

  onBadOrderedChange(): void {
    if (this.badOrdered) {
      this.badOrderDate = this.inspectedDate;
      this.badOrderDescription = '';
    } else {
      this.badOrderDate = new Date().toISOString().substring(0, 10);
      this.badOrderDescription = '';
    }
  }

  onSubmit(): void {
    // Validate required fields
    if (!this.carMark || !this.carNumber || !this.inspectedDate) {
      this.errorMessage = 'Please fill out all required fields.';
      this.successMessage = '';
      this.clearMessagesAfterDelay();
      return;
    }
    // Validate inspectedRailcar interface on the form data
    // infer if the railcar is bad ordered based on the form state
    const hasBadOrder =
      !!this.badOrderDate && !!this.badOrderDescription;

    const formData: InboundRailcar = {
      inboundId: 0, // Placeholder, will be set by backend
      carMark: this.carMark,
      carNumber: +this.carNumber,
      inspectedDate: this.inspectedDate,
      isRepaired: this.isRepaired,
      isEmpty: !this.isLoaded,
      badOrdered: this.badOrdered || hasBadOrder,
      repairDescription: this.repairDescription,
      badOrderedRailcar: (this.badOrdered || hasBadOrder) ? {
        inboundId: 0, // Placeholder, will be set by backend
        badOrderId: 0, // Placeholder, will be set by backend
        carMark: this.carMark,
        carNumber: +this.carNumber,
        badOrderDate: this.badOrderDate,
        badOrderDescription: this.badOrderDescription,
        isActive: true
        // badOrderId and repairedDate are optional and omitted here
      } : undefined
    };

    // Push to queue or edit existing entry
    if (this.editIndex !== null) {
      this.queuedRailcars[this.editIndex] = formData;
      this.editIndex = null;
      this.successMessage = 'Railcar updated in queue!';
    } else {
      this.queuedRailcars.push(formData);
      this.successMessage = 'Added to queue!';
    }

    this.errorMessage = '';
    this.clearForm();
    this.clearMessagesAfterDelay();
  }

  onBadOrderedSubmit(): void {
    if (!this.badOrderDate || !this.badOrderDescription) {
      this.errorMessage = 'Please fill out all bad order fields.';
      this.successMessage = '';
      this.clearMessagesAfterDelay();
      return;
    }

    // Set isBadOrdered to true and update badOrderedRailcar
    this.successMessage = 'Bad order details added!';
    this.errorMessage = '';
    this.showBadOrderModal = false;
    this.clearMessagesAfterDelay();
  }

  clearForm(): void {
    this.carMark = '';
    this.carNumber = '';
    this.inspectedDate = new Date().toISOString().substring(0, 10);
    this.isRepaired = false;
    this.repairDescription = '';
    this.isEmpty = false;
    this.badOrdered = false;
    this.badOrderDate = new Date().toISOString().substring(0, 10);
    this.badOrderDescription = '';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  private clearMessagesAfterDelay(delay: number = 5000): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    this.messageTimeout = setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, delay);
  }

  editQueuedRailcar(index: number): void {
    this.editIndex = index;
    const railcar = this.queuedRailcars[index];

    // Populate form with existing data
    this.carMark = railcar.carMark;
    this.carNumber = railcar.carNumber.toString();
    this.inspectedDate = railcar.inspectedDate;
    this.isRepaired = railcar.isRepaired;
    this.repairDescription = railcar.repairDescription || '';
    this.isEmpty = railcar.isEmpty;

    if (railcar.badOrdered && railcar.badOrderedRailcar) {
      this.isActive = true;
      this.badOrderDate = railcar.badOrderedRailcar.badOrderDate;
      this.badOrderDescription = railcar.badOrderedRailcar.badOrderDescription;
      this.showBadOrderModal = true;
    } else {
      this.badOrdered = false;
      this.showBadOrderModal = false;
    }
  }

  saveEdit(index: number): void {
    this.editIndex = null;
    this.successMessage = 'Railcar updated!';
    this.clearMessagesAfterDelay();
  }

  cancelEdit(): void {
    this.editIndex = null;
    this.clearForm();
    this.successMessage = 'Edit cancelled.';
    this.clearMessagesAfterDelay();
  }

  removeQueuedRailcar(index: number): void {
    if (confirm('Are you sure you want to remove this railcar from the queue?')) {
      this.queuedRailcars.splice(index, 1);
      this.successMessage = 'Railcar removed from queue!';
      this.clearMessagesAfterDelay();

      // Reset edit index if we're editing the removed item
      if (this.editIndex === index) {
        this.editIndex = null;
        this.clearForm();
      } else if (this.editIndex !== null && this.editIndex > index) {
        this.editIndex--;
      }
    }
  }

  // Enhanced error handling method
  submitQueuedRailcars(): void {
    if (this.queuedRailcars.length === 0) {
      this.errorMessage = 'No railcars queued for submission';
      this.clearMessagesAfterDelay();
      return;
    }

    this.loading = true;
    this.clearMessages();
    const queueLength = this.queuedRailcars.length;

    console.log('Frontend request: ', this.queuedRailcars);

    this.http.post(`${environment.apiUrl}/inspections`, this.queuedRailcars)
      .subscribe({
        next: (response) => {
          // Transform response to use isRepaired
          const transformedResponse = Array.isArray(response) ? response.map(railcar => ({
            ...railcar,
            isRepaired: railcar.repaired,  // convert from backend field name
          })) : response;

          console.log('Backend response:', response);
          this.queuedRailcars = [];
          this.loading = false;
          this.successMessage = `Successfully submitted ${queueLength} railcar inspection${queueLength > 1 ? 's' : ''}!`;
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error submitting to backend:', error);
          this.loading = false;

          // Handle different types of errors
          if (error.status === 0) {
            // Network error or CORS issue
            this.errorMessage = 'Connection failed. Please check if the server is running and try again.';
            console.error('Network Error Details:', {
              message: error.message,
              url: error.url,
              type: 'Network/CORS Error'
            });
          } else if (error.status >= 400 && error.status < 500) {
            // Client errors (400-499)
            this.errorMessage = `Request error (${error.status}): ${error.error?.message || 'Invalid request data'}`;
          } else if (error.status >= 500) {
            // Server errors (500-599)
            this.errorMessage = `Server error (${error.status}): Please try again later`;
          } else {
            // Generic fallback
            this.errorMessage = 'Failed to submit railcars. Please try again.';
          }

          this.clearMessagesAfterDelay();
        }
      });
  }

  retrySubmission(): void {
    this.submitQueuedRailcars();
  }
}