import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

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

type SortColumn = 'team' | 'matches' | 'total' | 'goals' | 'twoPts' | 'onePts';

@Component({
  selector: 'app-scoringstats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoringstats.component.html',
  styleUrls: ['./scoringstats.component.css']
})
export class ScoringstatsComponent {
  // Current division selected in the radio filters.
  selectedDivision: DivisionFilter = 'all';
  // All rows loaded from the API.
  scoringRows: ScoringStat[] = [];
  // Team name RGB value used for the colour dot.
  teamColorMap: Record<string, string> = {};
  // Current selected sort column. Default is Total.
  sortColumn: SortColumn = 'total';

  constructor(private dataService: DataService) {// Load teams and scoring stats
    this.loadTeams();
    this.loadScoringStats();
  }

  setDivision(division: DivisionFilter) {// Update the selected division filter.
    this.selectedDivision = division;
  }

  get visibleRows(): ScoringStat[] {
    const filteredRows = this.selectedDivision === 'all'
      ? [...this.scoringRows]
      : this.scoringRows.filter((row) => row.division === this.selectedDivision);

    return filteredRows.sort((a, b) => this.compareRows(a, b));
  }

  setSort(column: SortColumn): void {
    this.sortColumn = column;
  }

  getTeamColor(teamName: string): string {// Get the RGB color for a team - same as one used before
    const rgb = this.teamColorMap[teamName.toLowerCase()];
    return rgb ? `rgb(${rgb})` : 'gray';
  }

  // Load scoring stats from the API.
  private loadScoringStats(): void {
    this.dataService.getData('scoringstats').subscribe(
      (response) => {
        this.scoringRows = ((response.data as ScoringStat[]) || []).map((row) => ({
          division: Number(row.division) || 0,
          team: row.team || 'Unknown',
          matches: Number(row.matches) || 0,
          total: Number(row.total) || 0,
          goals: Number(row.goals) || 0,
          twoPts: Number(row.twoPts) || 0,
          onePts: Number(row.onePts) || 0
        }));
      },
      (error) => {
        console.error('Error fetching scoring stats:', error);
      }
    );
  }

  // Load teams so each row can display the team colour dot.
  private loadTeams(): void {
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

  private compareRows(a: ScoringStat, b: ScoringStat): number {
    if (this.sortColumn === 'team') {
      return (b.team || '').localeCompare(a.team || '');
    }

    if (this.sortColumn === 'matches') {
      return b.matches - a.matches;
    }

    if (this.sortColumn === 'goals') {
      return b.goals - a.goals;
    }

    if (this.sortColumn === 'twoPts') {
      return b.twoPts - a.twoPts;
    }

    if (this.sortColumn === 'onePts') {
      return b.onePts - a.onePts;
    }

    return b.total - a.total;
  }

}
