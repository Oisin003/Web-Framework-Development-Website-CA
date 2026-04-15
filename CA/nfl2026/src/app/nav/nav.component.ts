import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  constructor(private router: Router, private authService: AuthService) { }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();// Check if the user is logged in by calling the method in AuthService
  }

  logout(event: Event): void {
    event.preventDefault();// Call the logout method in the AuthService and navigate to the login page when the user logs out
    this.authService.logout();// Move to the login page after logging out
    this.router.navigate(['/login']);//
  }

}
