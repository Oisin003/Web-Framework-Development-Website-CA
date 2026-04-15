import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';

interface MatchRow {
  id: number;
  division: number;
  hteam: string;
  hteamscore: string;
  ateam: string;
  ateamscore: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  // All rows shown in the admin table.
  matches: MatchRow[] = [];

  // Show simple feedback messages on screen.
  errorMessage = '';

  // Keep track of which row is being saved.
  savingId: number | null = null;

  constructor(private dataService: DataService) {
    this.loadMatches();// Load all matches from the backend when the component starts
  }

  // Save one row after the user edits names or scores.
  updateMatch(match: MatchRow): void {
    this.savingId = match.id;
    this.errorMessage = '';

    // Send updated names and scores to the backend.
    this.dataService.putData(`results/${match.id}`, {
      hteam: match.hteam,
      hteamscore: match.hteamscore,
      ateam: match.ateam,
      ateamscore: match.ateamscore
    }).subscribe(
      () => {
        this.savingId = null;
      },
      (error) => {
        this.errorMessage = error?.error?.message || 'Could not update result';
        this.savingId = null;
      }
    );
  }

  // Load all matches from backend.
  private loadMatches(): void {
    this.dataService.getData('results').subscribe(
      (response) => {
        this.matches = response.data || [];
      },
      () => {
        this.errorMessage = 'Could not load matches';
      }
    );
  }

}
