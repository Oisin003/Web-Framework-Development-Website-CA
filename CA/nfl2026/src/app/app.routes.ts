import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { TeamsComponent } from './teams/teams.component';
import { PlayersComponent } from './players/players.component';
import { ManagersComponent } from './managers/managers.component';
import { FixturesComponent } from './fixtures/fixtures.component';
import { ResultsComponent } from './results/results.component';
import { ScoringstatsComponent } from './scoringstats/scoringstats.component';
import { ScoringstatsIIComponent } from './scoringstats-ii/scoringstats-ii.component';
import { TeamrankingsComponent } from './teamrankings/teamrankings.component';
import { ScoringchartComponent } from './scoringchart/scoringchart.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'Home Page' },
    { path: 'teams', component: TeamsComponent, title: 'Teams' },
    { path: 'players', component: PlayersComponent, title: 'Players' },
    { path: 'managers', component: ManagersComponent, title: 'Managers' },
    { path: 'fixtures', component: FixturesComponent, title: 'Fixtures' },
    { path: 'results', component: ResultsComponent, title: 'Results' },
    { path: 'teamrankings', component: TeamrankingsComponent, title: 'Team Rankings' },
    { path: 'team-rank', component: TeamrankingsComponent, title: 'Team Rankings' },
    { path: 'scoringstats', component: ScoringstatsComponent, title: 'Scoring Stats' },
    { path: 'score-stats', component: ScoringstatsComponent, title: 'Scoring Stats' },
    { path: 'scoringstatsII', component: ScoringstatsIIComponent, title: 'Scoring Stats II' },
    { path: 'scoring-stats', component: ScoringstatsIIComponent, title: 'Scoring Stats II' },
    { path: 'scoringcharts', component: ScoringchartComponent, title: 'Scoring Charts' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'admin', component: AdminComponent, title: 'Results Admin' },
    // Extra route - 404 error page
    { path: '**', component: HomeComponent, title: 'Page Not Found' }

];
