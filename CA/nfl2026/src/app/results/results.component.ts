import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

// Division filter used by the radio buttons.
type DivisionFilter = 'all' | 1 | 2 | 3 | 4;

// One row from the results API.
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

// Team data used to build the color lookup map.
interface Team {
  name: string;
  rgb: string;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  // Current selected division.
  selectedDivision: DivisionFilter = 'all';

  // All results returned by the API.
  results: FixtureResult[] = [];

  // Look up: team name to rgb string.
  teamColorMap: Record<string, string> = {};

  constructor(private dataService: DataService) {
    // Load colors and results when page opens.
    this.loadTeams();
    this.loadResults();
  }

  // Called when user changes division filter.
  setDivision(division: DivisionFilter) {
    this.selectedDivision = division;
  }

  // Results shown in UI after filtering and sorting.
  get visibleResults(): FixtureResult[] {
    const playedResults = this.results.filter((result) => this.hasPlayedResult(result));
    const resultsForDivision = playedResults.filter((result) => this.matchesSelectedDivision(result));
    return resultsForDivision.sort((a, b) => this.compareResults(a, b));
  }

  get visibleRounds(): number[] {
    const rounds = this.visibleResults.map((result) => result.round);
    return [...new Set(rounds)].sort((a, b) => a - b);
  }

  getResultsForRound(round: number): FixtureResult[] {
    return this.visibleResults.filter((result) => result.round === round);
  }

  // Returns team color for bullet dots.
  getTeamColor(teamName: string): string {
    const rgb = this.teamColorMap[teamName.toLowerCase()];
    return rgb ? `rgb(${rgb})` : 'gray';
  }

  private matchesSelectedDivision(result: FixtureResult): boolean {
    if (this.selectedDivision === 'all') {
      return true;
    }

    return result.division === this.selectedDivision;
  }

  private hasPlayedResult(result: FixtureResult): boolean {
    const isZeroScore = result.hteamscore === '0-0-0' && result.ateamscore === '0-0-0';// If all 0 - then no score
    const isZeroTotal = result.hteamtotal === 0 && result.ateamtotal === 0;// If both totals are 0 then no score
    return !(isZeroScore && isZeroTotal);
  }

  // Sort by division, then round, then team name.
  private compareResults(a: FixtureResult, b: FixtureResult): number {
    if (a.division !== b.division) {
      return a.division - b.division;
    }

    if (a.round !== b.round) {
      return a.round - b.round;
    }

    const homeTeamCompare = (a.hteam || '').localeCompare(b.hteam || '');
    if (homeTeamCompare !== 0) {
      return homeTeamCompare;
    }

    return a.id - b.id;
  }

  // Gets results from the backend - only the ones with a score
  private loadResults() {
    this.dataService.getData('results').subscribe(
      (response) => {
        this.results = response.data as FixtureResult[] || [];
      },
      (error) => {
        console.error('Error fetching the results data:', error);
      }
    );
  }

  // Gets teams and builds the color map used in table dots.
  private loadTeams() {
    this.dataService.getData('teams').subscribe(
      (response) => {
        const teams = response.data as Team[] || [];

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
