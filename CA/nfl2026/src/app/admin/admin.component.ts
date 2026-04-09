import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  // This array holds all result rows from the database.
  results: any[] = [];

  // Show simple feedback messages on screen.
  saveMessage = '';
  errorMessage = '';

  // Keep track of which row is being saved.
  savingId: number | null = null;

  constructor(private http: HttpClient) {
    // Load data when page opens.
    this.loadResults();
  }

  // Save one row after user edits the score fields.
  updateResult(result: any): void {
    this.savingId = result.id;
    this.saveMessage = '';
    this.errorMessage = '';

    // Send updated scores to the backend.
    this.http.put<any>(`http://localhost:3000/api/results/${result.id}`, {
      hteamscore: result.hteamscore,
      ateamscore: result.ateamscore
    }).subscribe(
      () => {
        this.saveMessage = `Updated result for ${result.hteam} vs ${result.ateam}`;
        this.savingId = null;
      },
      (error) => {
        this.errorMessage = error?.error?.message || 'Could not update result';
        this.savingId = null;
      }
    );
  }

  // Load all results from backend.
  private loadResults(): void {// Clear old messages before loading.
    this.http.get<any>('http://localhost:3000/api/results').subscribe(
      (response) => {
        this.results = response.data || [];// Handle case where response is not in expected format.
      },
      () => {
        this.errorMessage = 'Could not load results';// Show error if request fails.
      }
    );
  }

}
