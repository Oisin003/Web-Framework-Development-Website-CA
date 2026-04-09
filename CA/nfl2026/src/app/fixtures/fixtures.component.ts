import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// Filter type for the division buttons 
type DivisionFilter = 'all' | 1 | 2 | 3 | 4;

// Represents a single fixture from the API
interface Fixture {
  id: number;
  division: number;
  round: number;
  hteam: string;
  hteamscore: string;
  hteamtotal: number;
  ateam: string;
  ateamscore: string;
  ateamtotal: number;
}

// Represents a team from the API - this is used for the color
interface Team {
  name: string;
  rgb: string;
}

@Component({
  selector: 'app-fixtures',
  imports: [CommonModule],
  templateUrl: './fixtures.component.html',
  styleUrl: './fixtures.component.css'
})
export class FixturesComponent {
  // Currently selected division filter
  selectedDivision: DivisionFilter = 'all';
  // All fixtures loaded from the API
  fixtures: Fixture[] = [];
  // Maps team name (lowercase) to its RGB colour string
  teamColorMap: Record<string, string> = {};

  constructor(private http: HttpClient) {
    // Load teams and fixtures when the component starts
    this.loadTeams();
    this.loadFixtures();
  }

  // Called when the user clicks a division filter button
  setDivision(division: DivisionFilter) {
    this.selectedDivision = division;
  }

  // Returns fixtures filtered to rounds 6-7 and the selected division, sorted by round then division
  get filteredFixtures(): Fixture[] {
    return this.fixtures
      .filter((fixture) => fixture.round >= 6 && fixture.round <= 7)// Only include rounds 6 and 7
      .filter((fixture) => !this.isPlaceholderFixture(fixture))
      .filter((fixture) => this.selectedDivision === 'all' || fixture.division === this.selectedDivision)
      .sort((a, b) => {
        if (a.round !== b.round) {
          return a.round - b.round;// Sort by round first
        }
        if (a.division !== b.division) {// Sort by division within the same round
          return a.division - b.division;// This will group fixtures by division within each round
        }
        return a.id - b.id;// Finally sort by ID to ensure a consistent order
      });
  }

  // Returns a unique sorted list of round numbers from the filtered fixtures
  get displayedRounds(): number[] {
    const rounds = this.filteredFixtures.map((fixture) => fixture.round);
    return [...new Set(rounds)].sort((a, b) => a - b);
  }

  // Returns all fixtures for a specific round
  getFixturesForRound(round: number): Fixture[] {
    return this.filteredFixtures.filter((fixture) => fixture.round === round);
  }

  // Returns the CSS colour string for a team, or grey if not found
  getTeamColor(teamName: string): string {
    const rgb = this.teamColorMap[teamName.toLowerCase()];
    return rgb ? `rgb(${rgb})` : 'gray';// Default to gray if team color is missing
  }

  private isPlaceholderFixture(fixture: Fixture): boolean {
    return this.isPlaceholderTeam(fixture.hteam) || this.isPlaceholderTeam(fixture.ateam);
  }

  private isPlaceholderTeam(teamName: string): boolean {
    return /^Div\d(?:1st|2nd)$/i.test((teamName || '').trim());
  }

  // Fetches all fixtures from the API
  private loadFixtures() {
    this.http.get<{ data: Fixture[] }>('http://localhost:3000/api/fixtures').subscribe(
      (response) => {
        this.fixtures = response.data || [];
      },
      (error) => {
        console.error('Error fetching fixtures:', error);
      }
    );
  }

  // Fetches all teams and builds the colour map
  private loadTeams() {
    this.http.get<{ data: Team[] }>('http://localhost:3000/api/teams').subscribe(
      (response) => {
        const teams = response.data || [];
        // Build a lookup of team name -> rgb string
        this.teamColorMap = teams.reduce((acc, team) => {
          acc[team.name.toLowerCase()] = team.rgb;
          return acc;
        }, {} as Record<string, string>);
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

}
