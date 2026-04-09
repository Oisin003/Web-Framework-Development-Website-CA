import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Team {
  name: string;
}

@Component({
  selector: 'app-teamrankings',
  imports: [CommonModule],
  templateUrl: './teamrankings.component.html',
  styleUrls: ['./teamrankings.component.css']
})
export class TeamrankingsComponent {
  // Total number of votes each user gets.
  private readonly maxVotes = 5;

  teams: Team[] = [];
  votesRemaining = this.maxVotes;
  // Two teams currently shown as choices.
  firstTeam: Team | null = null;
  secondTeam: Team | null = null;
  // Team name to vote count.
  voteTotals: Record<string, number> = {};
  isSaving = false;

  constructor(private http: HttpClient, private router: Router) {
    this.loadTeams();
  }

  voteForFirstTeam() {// This records the users first vote
    this.vote(this.firstTeam);
  }

  voteForSecondTeam() {// This records the users second vote
    this.vote(this.secondTeam);
  }

  get canVote(): boolean {// This checks if the user has used up all 5 votes
    return !this.isSaving && this.votesRemaining > 0 && !!this.firstTeam && !!this.secondTeam;
  }

  // Load teams once, then pick the first random pair
  private loadTeams() {
    this.http.get<{ data: Team[] }>('http://localhost:3000/api/teams').subscribe(
      (response) => {
        this.teams = response.data || [];
        this.firstTeam = this.pickRandomTeam();
        this.secondTeam = this.pickRandomTeam(this.firstTeam?.name);
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  // Record a vote, keep the winner, and stop when all votes are used.
  private vote(team: Team | null) {
    if (!team || this.isSaving || this.votesRemaining <= 0) {
      return;
    }
    // Increment the vote total for the selected team and decrement remaining votes
    this.voteTotals[team.name] = (this.voteTotals[team.name] || 0) + 1;
    this.votesRemaining -= 1;// If no votes remain, save results and go to Teams page

    // If there are no votes left, save results and go to Teams page
    if (this.votesRemaining <= 0) {
      this.finishVoting();
      return;
    }

    // Winner stays on and faces a new random team.
    this.firstTeam = team;
    this.secondTeam = this.pickRandomTeam(team.name);// Pick a new random team to face the winner, excluding the winner
  }

  // Save the final vote totals to the backend, then go to Teams.
  private finishVoting() {
    this.isSaving = true;

    this.http.post('http://localhost:3000/api/teamrankings/votes', { voteRanks: this.voteTotals }).subscribe(
      () => {// After saving, move to the Teams page to see the updated rankings
        this.router.navigate(['/teams']);
        // Reference: https://angular.dev/guide/routing/navigate-to-routes
      },
      (error) => {
        this.isSaving = false;
        console.error('Error saving team rankings:', error);
      }
    );
  }

  // Pick a random team, optionally excluding one team.
  private pickRandomTeam(excludedTeamName?: string): Team | null {
    const options = excludedTeamName
      ? this.teams.filter((team) => team.name !== excludedTeamName)
      : this.teams;
    // Return null if there is no options
    if (!options.length) {
      return null;
    }
    // Pick a random index from the available options and return that team
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

}
