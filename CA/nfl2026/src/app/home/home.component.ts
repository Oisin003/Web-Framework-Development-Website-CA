import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

// Shape of one route row shown on the Home page.
interface ApiRoute {
  path: string;
  description: string;
  url: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Base URL used to build the links shown in the table.
  apiBaseUrl = 'http://localhost:3000/api';

  // Stores the latest JSON response from the API.
  jsonData: unknown = [];

  // Routes displayed on the Home page.
  routes: ApiRoute[] = [
    {
      path: '/teams',
      description: 'GET teams',
      url: 'http://localhost:3000/teams'
    },
    {
      path: '/players',
      description: 'GET players',
      url: 'http://localhost:3000/players'
    },
    {
      path: '/managers',
      description: 'GET managers',
      url: 'http://localhost:3000/managers'
    },
    {
      path: '/fixtures',
      description: 'GET fixtures',
      url: 'http://localhost:3000/fixtures'
    },
    {
      path: '/results',
      description: 'GET results',
      url: 'http://localhost:3000/results'
    }
  ];

  constructor(private dataService: DataService) {}

  // Calls the selected API route and shows the response on screen.
  fetchData(path: string): void {
    this.dataService.getData(path).subscribe({
      next: (data: unknown) => {
        this.jsonData = data;
      },
      error: (error: unknown) => {
        // If it breaks then this appears.
        console.error('There has been a terrible error fetching data:', error);
        this.jsonData = { error: 'No data' };
      }
    });
  }
}
