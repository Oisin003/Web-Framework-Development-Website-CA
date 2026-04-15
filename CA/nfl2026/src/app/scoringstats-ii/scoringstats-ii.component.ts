import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

// Fixture row returned from the API.
interface Fixture {
  division: number;
  round: number;
  hteam: string;
  ateam: string;
  hteamtotal: number;
  ateamtotal: number;
}

// Row for the "Total per match" table.
interface DivisionRow {
  division: number;
  round1: number;
  round2: number;
  round3: number;
  round4: number;
  round5: number;
}

// Row for the "Teams per Round" table.
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
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoringstats-ii.component.html',
  styleUrl: './scoringstats-ii.component.css'
})
export class ScoringstatsIIComponent {
  // First table data: average combined score per division/round.
  rows: DivisionRow[] = [];

  // Second table data: each team's score by round.
  teamRows: TeamRow[] = [];

  constructor(private dataService: DataService) {
    // Load and build both tables when component starts.
    this.loadData();
  }

  // Gets fixtures and prepares both table datasets.
  private loadData() {
    this.dataService.getData('fixtures').subscribe(
      (response) => {
        const fixtures = response.data || [];
        this.rows = this.buildDivisionRows(fixtures);
        this.teamRows = this.buildTeamRows(fixtures);
      },
      (error) => {
        console.error('Error fetching fixtures:', error);
      }
    );
  }

  // Builds division rows with average total score for rounds 1-5.
  private buildDivisionRows(fixtures: Fixture[]): DivisionRow[] {
    const divisionRows: DivisionRow[] = [];

    // Find all divisions that exist in the data.
    const divisionNumbers: number[] = [];
    for (const fixture of fixtures) {
      const div = Number(fixture.division);
      if (div > 0 && !divisionNumbers.includes(div)) {
        divisionNumbers.push(div);
      }
    }

    // Keep divisions in order: 1, 2, 3, 4...
    divisionNumbers.sort((a, b) => a - b);

    for (const division of divisionNumbers) {
      const row: DivisionRow = {
        division: division,
        round1: 0,
        round2: 0,
        round3: 0,
        round4: 0,
        round5: 0
      };

      // Calculate average total score for each round.
      for (let round = 1; round <= 5; round++) {
        let totalSum = 0;
        let matchCount = 0;

        for (const fixture of fixtures) {
          if (Number(fixture.division) !== division || Number(fixture.round) !== round) {
            continue;
          }

          const homeTotal = Number(fixture.hteamtotal) || 0;
          const awayTotal = Number(fixture.ateamtotal) || 0;

          // Ignore fixtures that were not played yet.
          if (homeTotal === 0 && awayTotal === 0) {
            continue;
          }

          totalSum = totalSum + homeTotal + awayTotal;
          matchCount = matchCount + 1;
        }

        let average = 0;
        if (matchCount > 0) {
          // Keep one decimal place for cleaner display - as shown in the video
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

  // Builds team rows showing each team's score in rounds 1-5.
  private buildTeamRows(fixtures: Fixture[]): TeamRow[] {
    const teamRows: TeamRow[] = [];

    for (const fixture of fixtures) {
      const round = Number(fixture.round);

      if (round < 1 || round > 5) {
        continue;
      }

      const homeTotal = Number(fixture.hteamtotal) || 0;
      const awayTotal = Number(fixture.ateamtotal) || 0;

      // Store home team score for this round.
      if (fixture.hteam && homeTotal > 0) {
        const teamRow = this.findOrCreateTeamRow(teamRows, fixture.hteam);
        if (round === 1) teamRow.round1 = homeTotal;
        if (round === 2) teamRow.round2 = homeTotal;
        if (round === 3) teamRow.round3 = homeTotal;
        if (round === 4) teamRow.round4 = homeTotal;
        if (round === 5) teamRow.round5 = homeTotal;
      }

      // Store away team score for this round.
      if (fixture.ateam && awayTotal > 0) {
        const teamRow = this.findOrCreateTeamRow(teamRows, fixture.ateam);
        if (round === 1) teamRow.round1 = awayTotal;
        if (round === 2) teamRow.round2 = awayTotal;
        if (round === 3) teamRow.round3 = awayTotal;
        if (round === 4) teamRow.round4 = awayTotal;
        if (round === 5) teamRow.round5 = awayTotal;
      }
    }

    // Show teams in alphabetical order.
    teamRows.sort((a, b) => a.team.localeCompare(b.team));

    return teamRows;
  }

  // Reuse an existing team row or create a new one.
  private findOrCreateTeamRow(teamRows: TeamRow[], teamName: string): TeamRow {
    for (const row of teamRows) {
      if (row.team === teamName) {
        return row;
      }
    }

    const newRow: TeamRow = {// Initialize new row with team name and empty scores.
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


