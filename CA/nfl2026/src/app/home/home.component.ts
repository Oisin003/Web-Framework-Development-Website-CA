import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  jsonData: any = [];

  routes = [
    {
      path: '/teams',
      description: 'GET teams',
      url: 'http://localhost:3000/api/teams'
    },
    {
      path: '/players',
      description: 'GET players',
      url: 'http://localhost:3000/api/players'
    },
    {
      path: '/managers',
      description: 'GET managers',
      url: 'http://localhost:3000/api/managers'
    },
    {
      path: '/fixtures',
      description: 'GET fixtures',
      url: 'http://localhost:3000/api/fixtures'
    },
    {
      path: '/results',
      description: 'GET results',
      url: 'http://localhost:3000/api/results'
    }
  ];

  constructor(private http: HttpClient) {}

  fetchData(path: string) {
    const url = `http://localhost:3000/api${path}`;
    this.http.get(url).subscribe(
      (data) => {
        this.jsonData = data;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.jsonData = { error: 'Failed to fetch data' };
      }
    );
  }
}
