import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Values typed by the user in the login form.
  email = '';
  password = '';

  // Message shown when login fails or form is incomplete.
  errorMessage = '';

  // Used to disable the button while waiting for API response.
  isSubmitting = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService
  ) { }

  // Runs when the user clicks Login.
  login(): void {
    // Clear old error message before trying again.
    this.errorMessage = '';

    // Basic check to make sure both fields are filled in.
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    // Prevent double-click while request is in progress.
    this.isSubmitting = true;

    // Data sent to the backend login endpoint.
    const loginData = {
      email: this.email.trim(),// Remove whitespace from email but not password
      password: this.password
    };

    this.dataService.postData('login', loginData).subscribe(
      () => {
        // Save logged-in state and move to Admin page.
        this.authService.login();
        this.isSubmitting = false;
        this.router.navigate(['/admin']);
      },
      (error) => {
        // Show backend message if available
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'The Login has failed - Try again :)';// if it breaks then show this
      }
    );
  }

}
