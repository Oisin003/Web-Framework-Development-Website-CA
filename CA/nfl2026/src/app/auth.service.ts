import { Injectable } from '@angular/core';

const AUTH_STORAGE_KEY = 'nfl2026_logged_in';

@Injectable({ providedIn: 'root' })// Injectable is used to mark this class as a service that can be injected into other components or services
export class AuthService {// 
  login(): void {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  }

  logout(): void {// Clear the login state from localStorage when logging out
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  isLoggedIn(): boolean {// Check if the user is logged in by looking for the login state in localStorage
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }
}
