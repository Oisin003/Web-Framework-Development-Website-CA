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

// These are the routes for all the pages - they are mapped to the components that should be shown when the user visits that page
export const routes: Routes = [
    { path : '', component : HomeComponent, title : 'Home Page' },
    { path : 'teams', component : TeamsComponent, title : 'Teams Page' },
    { path : 'players', component : PlayersComponent, title : 'Players Page' },
    { path : 'managers', component : ManagersComponent, title : 'Managers Page' },
    { path : 'fixtures', component : FixturesComponent, title : 'Fixtures Page' },
    { path : 'results', component : ResultsComponent, title : 'Results Page' },
    { path : 'teamrankings', component : TeamrankingsComponent, title : 'Team Rankings Page' },
    { path : 'team-rank', component : TeamrankingsComponent, title : 'Team Rankings Page' },
    { path : 'scoringstats', component : ScoringstatsComponent, title : 'Scoring Stats Page' },
    { path : 'score-stats', component : ScoringstatsComponent, title : 'Scoring Stats Page' },
    { path : 'scoringstatsII', component : ScoringstatsIIComponent, title : 'Scoring Stats II Page' },
    { path : 'scoring-stats-ii', component : ScoringstatsIIComponent, title : 'Scoring Stats II Page' },
    { path : 'scoringcharts', component : ScoringchartComponent, title : 'Scoring Charts Page' },
    { path : 'login', component : LoginComponent, title : 'Login Page' },
    { path : 'admin', component : AdminComponent, title : 'Results Admin Page' },
    { path : '**', component : HomeComponent, title : 'Page Not Found' }

];
