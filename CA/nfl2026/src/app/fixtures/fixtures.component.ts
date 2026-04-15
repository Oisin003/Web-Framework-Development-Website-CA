import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

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
  standalone: true,
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

  constructor(private dataService: DataService) {
    // Load teams and fixtures when the component starts
    this.loadTeams();
    this.loadFixtures();
  }

  // Called when the user clicks a division filter button
  setDivision(division: DivisionFilter) {
    this.selectedDivision = division;
  }

  // Fixtures shown in the UI after filter and sort rules are applied.
  get visibleFixtures(): Fixture[] {
    return this.fixtures
      .filter((fixture) => fixture.round >= 6 && fixture.round <= 7)// Only show rounds 6 and 7 which are the ones with real teams rather than placeholders (Also looks like what was in the video)
      .filter((fixture) => !this.isPlaceholderFixture(fixture))
      .filter((fixture) => this.selectedDivision === 'all' || fixture.division === this.selectedDivision)
      .sort((a, b) => this.compareFixtures(a, b));
  }

  get visibleRounds(): number[] {
    const rounds = this.visibleFixtures.map((fixture) => fixture.round);
    return [...new Set(rounds)].sort((a, b) => a - b);
  }

  getFixturesForRound(round: number): Fixture[] {
    return this.visibleFixtures.filter((fixture) => fixture.round === round);
  }

  // Returns the CSS colour string for a team, or grey if not found
  getTeamColor(teamName: string): string {
    const rgb = this.teamColorMap[teamName.toLowerCase()];
    return rgb ? `rgb(${rgb})` : 'gray';// Default to gray if team color is missing
  }

  private isPlaceholderFixture(fixture: Fixture): boolean {
    return this.isPlaceholderTeam(fixture.hteam) || this.isPlaceholderTeam(fixture.ateam);
  }

  private isPlaceholderTeam(teamName: string): boolean {// Placeholder teams have names like the Div ones
    return /^Div\d(?:1st|2nd)$/i.test((teamName || '').trim());// If team name is null or empty, it can't be a placeholder, so return false
  }

  private compareFixtures(a: Fixture, b: Fixture): number {// Sort by division, then round, then home team name, then ID 
    if (a.division !== b.division) {
      return a.division - b.division;// 
    }

    if (a.round !== b.round) {
      return a.round - b.round;// Sort by round within the same division
    }

    const homeTeamCompare = (a.hteam || '').localeCompare(b.hteam || '');// Compare home team names with null being an empty string
    if (homeTeamCompare !== 0) {
      return homeTeamCompare;
    }

    return a.id - b.id;// Sort by ID 
  }

  // Fetches all fixtures from the API
  private loadFixtures() {
    this.dataService.getData('fixtures').subscribe(// if it works, store the fixtures in the component state
      (response) => {
        this.fixtures = response.data as Fixture[] || [];
      },
      (error) => {
        console.error('Error fetching the fixtures data:', error);
      }
    );
  }

  // Fetches all teams and builds the colour map
  private loadTeams() {
    this.dataService.getData('teams').subscribe(
      (response) => {
        const teams = response.data as Team[] || [];
        // Build a lookup of team name -> rgb string
        this.teamColorMap = teams.reduce((acc, team) => {
          acc[team.name.toLowerCase()] = team.rgb;
          return acc;
        }, {} as Record<string, string>);
      },
      (error) => {
        console.error('Error fetching the teams data:', error);
      }
    );
  }

}
