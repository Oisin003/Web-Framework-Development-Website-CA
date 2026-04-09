import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// Type for the division filter radio buttons.
type DivisionFilter = 'all' | 1 | 2 | 3 | 4;

interface Team {// Type for team data fetched from the API.
  name: string;
  rgb: string;
}

interface ScoringStat {// Type for each row in the scoring stats table.
  division: number;
  team: string;
  matches: number;
  total: number;
  goals: number;
  twoPts: number;
  onePts: number;
}

@Component({
  selector: 'app-scoringstats',
  imports: [CommonModule],
  templateUrl: './scoringstats.component.html',
  styleUrls: ['./scoringstats.component.css']
})
export class ScoringstatsComponent {
  // Current division selected in the radio filters.
  selectedDivision: DivisionFilter = 'all';
  // Rows shown in the scoring stats table.
  stats: ScoringStat[] = [];
  // Team name RGB value used for the colour dot.
  teamColorMap: Record<string, string> = {};

  constructor(private http: HttpClient) {// Load teams and scoring stats 
    this.loadTeams();
    this.loadScoringStats();
  }

  setDivision(division: DivisionFilter) {// Update the selected division filter.
    this.selectedDivision = division;
  }

  get filteredStats(): ScoringStat[] {// Get the rows to show in the table based on the selected division filter.
    if (this.selectedDivision === 'all') {
      return this.stats;
    }

    return this.stats.filter((stat) => stat.division === this.selectedDivision);
  }

  getTeamColor(teamName: string): string {// Get the RGB color for a team - same as one used before
    const rgb = this.teamColorMap[teamName.toLowerCase()];
    return rgb ? `rgb(${rgb})` : 'gray';
  }

  // Load scoring stats from the API.
  private loadScoringStats() {
    this.http.get<{ data: ScoringStat[] }>('http://localhost:3000/api/scoringstats').subscribe(
      (response) => {// Map the API response to ensure all fields are present and have correct types
        this.stats = (response.data || []).map((row) => ({
          division: Number(row.division) || 0,
          team: row.team || 'Unknown',
          matches: Number(row.matches) || 0,
          total: Number(row.total) || 0,
          goals: Number(row.goals) || 0,
          twoPts: Number(row.twoPts) || 0,
          onePts: Number(row.onePts) || 0
        }));
      },
      (error) => {// Log any errors
        console.error('Error fetching scoring stats:', error);
      }
    );
  }

  // Load teams so each row can display the team colour dot.
  private loadTeams() {
    this.http.get<{ data: Team[] }>('http://localhost:3000/api/teams').subscribe(
      (response) => {
        const teams = response.data; // Get the team data from the API response

        this.teamColorMap = teams.reduce((acc, team) => {
          acc[team.name.toLowerCase()] = team.rgb;// Map team names to their RGB values 
          return acc;// Return the accumulator for the next iteration
        }, {} as Record<string, string>);// Initialize the accumulator as an empty object
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

}
