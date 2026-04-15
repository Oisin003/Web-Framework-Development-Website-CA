// Centralized HTTP service for all API communication with the backend.
// Provides the methods like GET, POST, PUT and also  handles URL configuration.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Base URL for all backend API calls.
  private readonly apiBaseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Generic GET request used across components.
  getData(route: string) {
    return this.http.get<any>(`${this.apiBaseUrl}/${this.normalizeRoute(route)}`);
  }

  // POST request used for create/login/save actions.
  postData(route: string, body: unknown) {
    return this.http.post<any>(`${this.apiBaseUrl}/${this.normalizeRoute(route)}`, body);
  }

  // PUT request used for update actions.
  putData(route: string, body: unknown) {
    return this.http.put<any>(`${this.apiBaseUrl}/${this.normalizeRoute(route)}`, body);
  }

  // Removes leading slash so route works with template string URL.
  private normalizeRoute(route: string): string {
    return (route || '').replace(/^\/+/, '');
  }
}

// Reference: https://www.w3schools.com/angular/angular_services.asp