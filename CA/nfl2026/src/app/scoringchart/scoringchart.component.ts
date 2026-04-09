import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

// One team from the teams API.
interface Team {
  name: string;
  rgb: string;
}

// One fixture from the fixtures API.
interface Fixture {
  hteam: string;
  ateam: string;
  hteamtotal: number;
  ateamtotal: number;
}

// One row shown in the scoring chart table.
interface ScoringChartRow {
  team: string;
  color: string;
  for: number;
  against: number;
}

@Component({
  selector: 'app-scoringchart',
  imports: [CommonModule],
  templateUrl: './scoringchart.component.html',
  styleUrl: './scoringchart.component.css'
})
export class ScoringchartComponent implements AfterViewInit {
  // This array is used by the HTML table.
  rows: ScoringChartRow[] = [];
  // This points to the empty div where D3 will draw the SVG chart.
  @ViewChild('chartHost') chartHost?: ElementRef<HTMLDivElement>;
  // We only draw the chart after Angular has created the chart div.
  private viewReady = false;

  constructor(private http: HttpClient) {
    // Load the data as soon as the page opens.
    this.loadScoringChart();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.drawChart();
  }

  // Step 1: get all real teams.
  // Step 2: get all fixtures.
  // Step 3: build the table rows.
  private loadScoringChart() {
    this.http.get<{ data: Team[] }>('http://localhost:3000/api/teams').subscribe(
      (teamsResponse) => {
        // If the API sends back nothing, use an empty array.
        const teams = teamsResponse.data || [];

        this.http.get<{ data: Fixture[] }>('http://localhost:3000/api/fixtures').subscribe(
          (fixturesResponse) => {
            // If the API sends back nothing, use an empty array.
            const fixtures = fixturesResponse.data || [];

            // Build the final rows for the table.
            this.rows = this.buildRows(teams, fixtures);
            this.drawChart();
          }
        );
      }
    );
  }

  // Make one row for each team.
  // Then check every fixture and add up the scores for that team.
  private buildRows(teams: Team[], fixtures: Fixture[]): ScoringChartRow[] {
    const rows: ScoringChartRow[] = [];

    // Go through every real team from the teams table.
    for (const team of teams) {
      // Start both totals at 0.
      let pointsFor = 0;
      let pointsAgainst = 0;

      // Convert the team name to lowercase so name matching is easier.
      const teamName = team.name.toLowerCase();

      // Look through every fixture and see whether this team was home or away.
      for (const fixture of fixtures) {
        // If this team was the home team, add the home total to the loop
        // and the away total to "against".
        if (fixture.hteam?.toLowerCase() === teamName) {
          pointsFor += Number(fixture.hteamtotal) || 0;
          pointsAgainst += Number(fixture.ateamtotal) || 0;
        }

        // If this team was the away team, do the opposite.
        if (fixture.ateam?.toLowerCase() === teamName) {
          pointsFor += Number(fixture.ateamtotal) || 0;
          pointsAgainst += Number(fixture.hteamtotal) || 0;
        }
      }

      // Add the finished row to the rows array.
      rows.push({
        team: team.name,
        color: team.rgb ? `rgb(${team.rgb})` : 'gray',
        for: pointsFor,
        against: pointsAgainst
      });
    }

    // Sort the rows alphabetically 
    return rows.sort((a, b) => a.team.localeCompare(b.team));
  }

  // Draws a simple For/Against chart under the table.
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

  // Use first 2 letters as the short label in the chart bars.
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
