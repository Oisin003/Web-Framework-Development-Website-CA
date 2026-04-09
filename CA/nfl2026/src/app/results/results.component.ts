import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type DivisionFilter = 'all' | 1 | 2 | 3 | 4;

// This interface represents the structure of a fixture result as returned by the API.
interface FixtureResult {
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

// This interface represents the structure of a team as returned by the API.
interface Team {
  name: string;
  rgb: string;
}

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  // Current division selected by the user.
  selectedDivision: DivisionFilter = 'all';
  // Results fetched from the API.
  results: FixtureResult[] = [];
  // Lookup map for team color dots
  teamColorMap: Record<string, string> = {};

  constructor(private http: HttpClient) {
    // Load teams and results when component starts.
    this.loadTeams();
    this.loadResults();
  }

  // Update selected division when a radio button is clicked.
  setDivision(division: DivisionFilter) {
    this.selectedDivision = division;
  }

  // Filter then sort rows for display.
  // https://www.w3schools.com/jsref/jsref_filter.asp
  get filteredResults(): FixtureResult[] {
    const completedResults = this.results.filter((result) => this.hasPlayedResult(result));
    const divisionFiltered = completedResults.filter((result) => this.matchesSelectedDivision(result));
    return divisionFiltered.sort((a, b) => this.sortByRoundDivisionAndId(a, b));
  }

  // Build unique round numbers for section headers.
  get displayedRounds(): number[] {
    const rounds = this.filteredResults.map((result) => result.round);
    return [...new Set(rounds)].sort((a, b) => a - b);
  }

  // Return all rows for one round.
  getResultsForRound(round: number): FixtureResult[] {
    return this.filteredResults.filter((result) => result.round === round);
  }

  // Return the team color for the dot; use gray if missing.
  getTeamColor(teamName: string): string {
    const rgb = this.teamColorMap[teamName.toLowerCase()];
    return rgb ? `rgb(${rgb})` : 'gray';
  }
  // Check if a result matches the currently selected division filter.
  private matchesSelectedDivision(result: FixtureResult): boolean {
    if (this.selectedDivision === 'all') {
      return true;
    }

    return result.division === this.selectedDivision;
  }

  // Treat fixtures with all-zero scores/totals as unplayed and hide them.
  private hasPlayedResult(result: FixtureResult): boolean {
    const isZeroScore = result.hteamscore === '0-0-0' && result.ateamscore === '0-0-0';
    const isZeroTotal = result.hteamtotal === 0 && result.ateamtotal === 0;
    return !(isZeroScore && isZeroTotal);
  }

  // Sort results first by round, then by division, then by ID.
  private sortByRoundDivisionAndId(a: FixtureResult, b: FixtureResult): number {
    if (a.round !== b.round) {
      return a.round - b.round;
    }

    if (a.division !== b.division) {
      return a.division - b.division;
    }

    return a.id - b.id;
  }
  // Load results from the backend API.
  private loadResults() {
    // Get match results from backend.
    this.http.get<{ data: FixtureResult[] }>('http://localhost:3000/api/results').subscribe(
      (response) => {
        this.results = response.data || [];
      },
      (error) => {
        console.error('Error fetching results:', error);
      }
    );
  }
  // Load teams from the backend API and build a lookup map for team colors.
  // This uses the same functionality as the Teams loader
  private loadTeams() {
    // Get team colors from backend.
    this.http.get<{ data: Team[] }>('http://localhost:3000/api/teams').subscribe(
      (response) => {
        const teams = response.data || [];

        // Convert team array into a fast lookup object.
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
