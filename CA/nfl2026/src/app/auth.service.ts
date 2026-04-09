import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const AUTH_STORAGE_KEY = 'nfl2026_logged_in';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(this.readLoginState());
  readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(): void {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.isLoggedInSubject.next(false);
  }

  private readLoginState(): boolean {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }
}
