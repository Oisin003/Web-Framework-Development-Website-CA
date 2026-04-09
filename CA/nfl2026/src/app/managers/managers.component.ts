import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-managers',
  imports: [CommonModule],
  templateUrl: './managers.component.html',
  styleUrl: './managers.component.css'
})
export class ManagersComponent implements OnInit {
  managers: any[] = [];// Initialize an empty array to hold the managers data

  // Inject the HttpClient service to make HTTP requests
  constructor(private http: HttpClient) { }

  // Lifecycle hook that is called after the component has been initialized
  ngOnInit() {
    this.loadManagers();
  }
  //https://www.geeksforgeeks.org/angular-js/purpose-of-the-ngoninit-method-in-angular/

  // Method to load managers data from the backend API
  loadManagers() {
    this.http.get<any>('http://localhost:3000/api/managers').subscribe(
      (response) => { this.managers = response.data; },// If it works assign the response data to the managers array
      (error) => { console.error('Error fetching managers from the Database:', error); }// Display an error message 
    );
  }
}