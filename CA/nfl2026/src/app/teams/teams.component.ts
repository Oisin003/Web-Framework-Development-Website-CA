import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Team {
  id: number;
  name: string;
  rgb: string;
  powerrank: number;
}

@Component({
  selector: 'app-teams',
  imports: [CommonModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent {
  teams: Team[] = [];// Initialize an empty array to hold the teams data

  constructor(private http: HttpClient) {
    this.http.get<{ data: Team[] }>('http://localhost:3000/api/teams').subscribe(
      (response) => {
        this.teams = response.data || [];
      },// 
      (error) => { console.error('Error fetching teams:', error); }// Error message displayed if the data fails to load
    );
  }
}
