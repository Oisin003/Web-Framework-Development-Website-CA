import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

// Team row returned from the API.
interface Team {
  id: number;
  name: string;
  rgb: string;
  powerrank: number;
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent {
  // Teams shown in the table.
  teams: Team[] = [];

  constructor(private dataService: DataService) {
    // Load data when the component opens.
    this.loadTeams();
  }

  // Fetches team data from the backend API.
  private loadTeams(): void {
    this.dataService.getData('teams').subscribe(
      (response) => {
        this.teams = response.data as Team[] || [];
      },
      (error) => {
        // Log errors to browser console for debugging.
        console.error('Teams data cannot be displayed at this time:', error);
      }
    );
  }
}
