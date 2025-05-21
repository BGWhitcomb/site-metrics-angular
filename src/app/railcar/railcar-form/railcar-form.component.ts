import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-railcar-form',
  templateUrl: './railcar-form.component.html',
  styleUrls: ['./railcar-form.component.css']
})
export class RailcarFormComponent implements OnInit {
  carMark: string = '';
  carNumber: string = '';
  inspectedDate: string = '';
  repaired: boolean = false;
  repairDescription: string = '';
  isLoaded: boolean = false;
  badOrdered: boolean = false;
  badOrderDate: string = '';
  badOrderDescription: string = '';
  showBadOrderModal: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  queuedRailcars: any[] = [];
  editIndex: number | null = null;

  ngOnInit() {
    const today = new Date().toISOString().substring(0, 10);
    this.inspectedDate = today;
    this.badOrderDate = today;
  }

  onRepairedChange() {
    if (!this.repaired) {
      this.repairDescription = '';
    }
  }

  onBadOrderedChange() {
    if (this.badOrdered) {
      this.badOrderDate = this.inspectedDate;
      this.badOrderDescription = '';
    } else {
      this.badOrderDate = new Date().toISOString().substring(0, 10);
      this.badOrderDescription = '';
    }
  }

  onSubmit() {
    // Handle form submission to table for queuing
    const formData = {
      carMark: this.carMark,
      carNumber: this.carNumber,
      inspectedDate: this.inspectedDate,
      repaired: this.repaired,
      repairDescription: this.repairDescription,
      isLoaded: this.isLoaded,
      badOrder: this.showBadOrderModal
        ? {
          badOrderDate: this.badOrderDate,
          badOrderDescription: this.badOrderDescription
        }
        : null
    };
    // push to queue or edit existing entry
    if (this.editIndex !== null) {
      this.queuedRailcars[this.editIndex] = formData;
      this.editIndex = null;
    } else {
      this.queuedRailcars.push(formData);
    }
    // Reset form or show confirmation as needed
    if (this.carMark && this.carNumber && this.inspectedDate) {
      this.successMessage = 'Added to queue!';
      this.errorMessage = '';
    } else {
      this.successMessage = '';
      this.errorMessage = 'Please fill out all required fields.';
    }
    this.clearForm();
    this.clearMessagesAfterDelay();
  }



  onBadOrderedSubmit() {
    // Reset form or show confirmation as needed
    if (this.badOrderDate && this.badOrderDescription) {
      this.successMessage = 'Bad order details added!';
      this.errorMessage = '';
      this.showBadOrderModal = false;
    } else {
      this.successMessage = '';
      this.errorMessage = 'Please fill out all bad order fields.';
    }
    this.clearMessagesAfterDelay();
  }

  clearForm() {
    this.carMark = '';
    this.carNumber = '';
    this.inspectedDate = new Date().toISOString().substring(0, 10);
    this.repaired = false;
    this.repairDescription = '';
    this.isLoaded = false;
    this.badOrdered = false;
    this.badOrderDate = new Date().toISOString().substring(0, 10);
    this.badOrderDescription = '';
  }

  clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
  saveEdit(index: number) {
    this.editIndex = null;
    this.successMessage = 'Railcar updated!';
    this.clearMessagesAfterDelay();
  }

  cancelEdit() {
    this.editIndex = null;
    this.successMessage = 'Edit cancelled.';
    this.clearMessagesAfterDelay();
  }
  editQueuedRailcar(index: number) {
    this.editIndex = index;
  }

  removeQueuedRailcar(index: number) {
    this.queuedRailcars.splice(index, 1);
    this.successMessage = 'Railcar removed from queue!';
  }
  submitAllToBackend() {
    // Replace with actual logic
    console.log('Submitting to backend:', this.queuedRailcars);
    this.queuedRailcars = [];
    this.successMessage = 'All queued submissions sent!';
    this.clearMessagesAfterDelay();
  }
}