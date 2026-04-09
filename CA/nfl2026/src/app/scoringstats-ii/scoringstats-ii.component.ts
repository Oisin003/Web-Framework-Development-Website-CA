import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// Describes one fixture row returned by the API
interface Fixture {
  division: number;
  round: number;
  hteam: string;
  ateam: string;
  hteamtotal: number;
  ateamtotal: number;
}

// One row in the "Total per match" table (one row per division)
interface DivisionRow {
  division: number;
  round1: number;
  round2: number;
  round3: number;
  round4: number;
  round5: number;
}

// One row in the "Teams per Round" table (one row per team)
interface TeamRow {
  team: string;
  round1: number;
  round2: number;
  round3: number;
  round4: number;
  round5: number;
}

@Component({
  selector: 'app-scoringstats-ii',
  imports: [CommonModule],
  templateUrl: './scoringstats-ii.component.html',
  styleUrl: './scoringstats-ii.component.css'
})
export class ScoringstatsIIComponent {
  // Holds the rows shown in the "Total per match" table
  rows: DivisionRow[] = [];

  // Holds the rows shown in the "Teams per Round" table
  teamRows: TeamRow[] = [];

  constructor(private http: HttpClient) {
    this.loadData();
  }

  // Called on startup - fetches all fixtures from the API
  private loadData() {
    this.http.get<{ data: Fixture[] }>('http://localhost:3000/api/fixtures').subscribe(
      (response) => {
        const fixtures = response.data || [];

        // Build both tables from the same fixtures data
        this.rows = this.buildDivisionRows(fixtures);
        this.teamRows = this.buildTeamRows(fixtures);
      },
      (error) => {
        console.error('Error fetching fixtures:', error);
      }
    );
  }

  // Builds the "Total per match" table.
  // Shows the average combined score per match, grouped by division and round.
  private buildDivisionRows(fixtures: Fixture[]): DivisionRow[] {
    const divisionRows: DivisionRow[] = [];

    // Step 1: collect all unique division numbers
    const divisionNumbers: number[] = [];
    for (const fixture of fixtures) {
      const div = Number(fixture.division);
      if (div > 0 && !divisionNumbers.includes(div)) {
        divisionNumbers.push(div);
      }
    }

    // Step 2: sort divisions lowest to highest
    divisionNumbers.sort((a, b) => a - b);

    // Step 3: build one row per division
    for (const division of divisionNumbers) {
      const row: DivisionRow = {
        division: division,
        round1: 0,
        round2: 0,
        round3: 0,
        round4: 0,
        round5: 0
      };

      // Step 4: calculate average match total for rounds 1 to 5
      for (let round = 1; round <= 5; round++) {
        let totalSum = 0;
        let matchCount = 0;

        for (const fixture of fixtures) {
          // Skip fixtures not in this division or round
          if (Number(fixture.division) !== division || Number(fixture.round) !== round) {
            continue;
          }

          const homeTotal = Number(fixture.hteamtotal) || 0;
          const awayTotal = Number(fixture.ateamtotal) || 0;

          // Skip fixtures that haven't been played yet
          if (homeTotal === 0 && awayTotal === 0) {
            continue;
          }

          totalSum = totalSum + homeTotal + awayTotal;
          matchCount = matchCount + 1;
        }

        // Calculate the average, rounded to 1 decimal place
        let average = 0;
        if (matchCount > 0) {
          average = Math.round((totalSum / matchCount) * 10) / 10;
        }

        if (round === 1) row.round1 = average;
        if (round === 2) row.round2 = average;
        if (round === 3) row.round3 = average;
        if (round === 4) row.round4 = average;
        if (round === 5) row.round5 = average;
      }

      divisionRows.push(row);
    }

    return divisionRows;
  }

  // Builds the "Teams per Round" table.
  // Shows each team's score for each of rounds 1 to 5.
  private buildTeamRows(fixtures: Fixture[]): TeamRow[] {
    const teamRows: TeamRow[] = [];

    for (const fixture of fixtures) {
      const round = Number(fixture.round);

      // Only include rounds 1 to 5
      if (round < 1 || round > 5) {
        continue;
      }

      const homeTotal = Number(fixture.hteamtotal) || 0;
      const awayTotal = Number(fixture.ateamtotal) || 0;

      // Record the home team's score for this round
      if (fixture.hteam && homeTotal > 0) {
        const teamRow = this.findOrCreateTeamRow(teamRows, fixture.hteam);
        if (round === 1) teamRow.round1 = homeTotal;
        if (round === 2) teamRow.round2 = homeTotal;
        if (round === 3) teamRow.round3 = homeTotal;
        if (round === 4) teamRow.round4 = homeTotal;
        if (round === 5) teamRow.round5 = homeTotal;
      }

      // Record the away team's score for this round
      if (fixture.ateam && awayTotal > 0) {
        const teamRow = this.findOrCreateTeamRow(teamRows, fixture.ateam);
        if (round === 1) teamRow.round1 = awayTotal;
        if (round === 2) teamRow.round2 = awayTotal;
        if (round === 3) teamRow.round3 = awayTotal;
        if (round === 4) teamRow.round4 = awayTotal;
        if (round === 5) teamRow.round5 = awayTotal;
      }
    }

    // Sort teams alphabetically by name
    teamRows.sort((a, b) => a.team.localeCompare(b.team));

    return teamRows;
  }

  // Looks for a team row by name. Creates and adds one if it doesn't exist yet.
  private findOrCreateTeamRow(teamRows: TeamRow[], teamName: string): TeamRow {
    for (const row of teamRows) {
      if (row.team === teamName) {
        return row;
      }
    }

    // Team not found - create a new blank row
    const newRow: TeamRow = {
      team: teamName,
      round1: 0,
      round2: 0,
      round3: 0,
      round4: 0,
      round5: 0
    };
    teamRows.push(newRow);
    return newRow;
  }
}


