import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

// Team info needed for voting.
interface Team {
  id: number;
  name: string;
}

@Component({
  selector: 'app-teamrankings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teamrankings.component.html',
  styleUrls: ['./teamrankings.component.css']
})
export class TeamrankingsComponent {
  // Total votes each user can cast.
  private readonly maxVotes = 5;

  // Teams loaded from the API.
  teams: Team[] = [];

  // Countdown shown on screen.
  votesRemaining = this.maxVotes;

  // Two teams currently shown as voting choices.
  firstTeam: Team | null = null;
  secondTeam: Team | null = null;

  // Stores vote totals by team id.
  votesByTeamId: Record<string, number> = {};

  // Prevents voting while save request is running.
  isSaving = false;

  constructor(private dataService: DataService, private router: Router) {
    // Load teams when the page opens.
    this.loadTeams();
  }

  // Vote for the first team button.
  voteForFirstTeam() {
    this.recordVote(this.firstTeam);
  }

  // Vote for the second team button.
  voteForSecondTeam() {
    this.recordVote(this.secondTeam);
  }

  // Used to enable/disable vote buttons in template.
  get canVote(): boolean {
    return !this.isSaving && this.votesRemaining > 0 && !!this.firstTeam && !!this.secondTeam;
  }

  // Fetches teams and picks the first random pair.
  private loadTeams() {
    this.dataService.getData('teams').subscribe(
      (response) => {
        this.teams = response.data || [];
        this.firstTeam = this.getRandomTeam();
        this.secondTeam = this.getRandomTeam(this.firstTeam?.name);
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  // Adds one vote to the selected team.
  private recordVote(team: Team | null): void {
    if (!team || this.isSaving || this.votesRemaining <= 0) {
      return;
    }

    const voteKey = String(team.id);
    this.votesByTeamId[voteKey] = (this.votesByTeamId[voteKey] || 0) + 1;
    this.votesRemaining -= 1;

    if (this.votesRemaining <= 0) {
      // Save votes when no votes remain.
      this.saveVotesAndGoToTeams();
      return;
    }

    // Winner stays, challenger changes.
    this.firstTeam = team;
    this.secondTeam = this.getRandomTeam(team.name);
  }

  // Sends final vote totals to backend and redirects to Teams.
  private saveVotesAndGoToTeams(): void {
    this.isSaving = true;

    this.dataService.postData('teamrankings/votes', { voteRanks: this.votesByTeamId }).subscribe(
      () => {
        this.router.navigate(['/teams']);
      },
      (error) => {
        this.isSaving = false;
        console.error('Cannot save the team rankings data at this moment:', error);
      }
    );
  }

  // Returns a random team, optionally excluding one by name.
  private getRandomTeam(excludedTeamName?: string): Team | null {
    const options = excludedTeamName
      ? this.teams.filter((team) => team.name !== excludedTeamName)
      : this.teams;

    if (!options.length) {
      return null;
    }
    // Pick a random team 
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

}
