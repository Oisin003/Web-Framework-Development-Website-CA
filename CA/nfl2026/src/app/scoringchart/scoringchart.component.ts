import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';

// Team row from the teams API.
interface Team {
  name: string;
  rgb: string;
}

// Fixture row from the fixtures API.
interface Fixture {
  hteam: string;
  ateam: string;
  hteamtotal: number;
  ateamtotal: number;
}

// Final row used by both the table and chart.
interface ScoringChartRow {
  team: string;
  color: string;
  for: number;
  against: number;
}

@Component({
  selector: 'app-scoringchart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoringchart.component.html',
  styleUrl: './scoringchart.component.css'
})
export class ScoringchartComponent implements AfterViewInit {
  // Data shown in the table and used for chart bars.
  rows: ScoringChartRow[] = [];

  // Host element where D3 appends the SVG.
  @ViewChild('chartHost') chartHost?: ElementRef<HTMLDivElement>;

  // Prevent drawing before the view is ready.
  private viewReady = false;

  constructor(private dataService: DataService) {
    // Load API data as soon as component is created.
    this.loadScoringChart();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.drawChart();
  }

  private loadScoringChart() {
    this.dataService.getData('teams').subscribe(
      (teamsResponse) => {
        const teams = teamsResponse.data || [];

        // Load fixtures next, then build rows for the table/chart.
        this.dataService.getData('fixtures').subscribe(
          (fixturesResponse) => {
            const fixtures = fixturesResponse.data || [];
            this.rows = this.buildRows(teams, fixtures);
            this.drawChart();
          }
        );
      }
    );
  }

  private buildRows(teams: Team[], fixtures: Fixture[]): ScoringChartRow[] {
    const rows: ScoringChartRow[] = [];

    for (const team of teams) {
      let pointsFor = 0;
      let pointsAgainst = 0;

      const teamName = team.name.toLowerCase();

      for (const fixture of fixtures) {
        // Add totals when this team appears as home side.
        if (fixture.hteam?.toLowerCase() === teamName) {
          pointsFor += Number(fixture.hteamtotal) || 0;
          pointsAgainst += Number(fixture.ateamtotal) || 0;
        }

        // Add totals when this team appears as away side.
        if (fixture.ateam?.toLowerCase() === teamName) {
          pointsFor += Number(fixture.ateamtotal) || 0;
          pointsAgainst += Number(fixture.hteamtotal) || 0;
        }
      }

      rows.push({
        team: team.name,
        color: team.rgb ? `rgb(${team.rgb})` : 'gray',// If there is no color then make it grey
        for: pointsFor,
        against: pointsAgainst
      });
    }

    return rows.sort((a, b) => a.team.localeCompare(b.team));// Sort alphabetically by team name for the table
  }

  // Draws the D3 bar chart under the table.
  private drawChart() {
    if (!this.viewReady || !this.chartHost) {
      return;
    }

    const host = this.chartHost.nativeElement;
    d3.select(host).selectAll('*').remove();

    if (this.rows.length === 0) {
      return;
    }

    const margin = { top: 10, right: 8, bottom: 16, left: 8 };
    const barWidth = 25;
    const gap = 5;
    const chartHeight = 250;
    const halfHeight = chartHeight / 2;
    const chartWidth = this.rows.length * (barWidth + gap) + gap;

    const maxValue = d3.max(this.rows, (row: ScoringChartRow) => Math.max(row.for, row.against)) || 1;
    const barScale = d3.scaleLinear().domain([0, maxValue]).range([0, halfHeight - 18]);

    const svg = d3
      .select(host)
      .append('svg')
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', chartHeight + margin.top + margin.bottom)
      .attr('class', 'for-against-svg');

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      const x = gap + i * (barWidth + gap);
      const forHeight = barScale(row.for);
      const againstHeight = barScale(row.against);

      chart
        .append('rect')
        .attr('x', x)
        .attr('y', halfHeight - forHeight)
        .attr('width', barWidth)
        .attr('height', forHeight)
        .attr('fill', '#4c7fad');

      chart
        .append('rect')
        .attr('x', x)
        .attr('y', halfHeight)
        .attr('width', barWidth)
        .attr('height', againstHeight)
        .attr('fill', '#b40000');

      chart
        .append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', halfHeight - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(this.getShortName(row.team));

      chart
        .append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', halfHeight - forHeight - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('font-size', 12)
        .text(row.for);

      chart
        .append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', halfHeight + againstHeight + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('font-size', 12)
        .text(row.against);
    }
  }

  // Uses two letters for the team label inside bars.
  private getShortName(teamName: string): string {
    const cleanedName = (teamName || '').trim().toUpperCase();

    if (cleanedName.length === 0) {
      return '';
    }

    if (cleanedName.length === 1) {
      return cleanedName;
    }

    return `${cleanedName[0]}${cleanedName[cleanedName.length - 1]}`;
  }

}
