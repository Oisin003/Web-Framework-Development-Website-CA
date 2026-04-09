import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Store what the user types in the form.
  email = '';
  password = '';

  // Show this message if login fails.
  errorMessage = '';

  // Disable the button while waiting
  isSubmitting = false;

  constructor(
    private router: Router,// To navigate to admin page after login.
    private authService: AuthService,// To update login state in the app.
    private http: HttpClient// To send login request to the API.
  ) { }

  // Run when the Login button is clicked.
  login(): void {
    // Clear old message before trying again.
    this.errorMessage = '';

    // Form check - make sure user entered something before sending request.
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    // Lock button while request is running so user can't click multiple times.
    this.isSubmitting = true;

    // Send the users login details to the API.
    const loginData = {
      email: this.email.trim(),// Remove whitespace from email.
      password: this.password// Password can be used as is, no trimming.
    };

    this.http.post<any>('http://localhost:3000/api/login', loginData).subscribe(
      () => {
        // Login works !
        this.authService.login();// Update auth state in the app.
        this.isSubmitting = false;// Re-enable button.
        this.router.navigate(['/admin']);// Go to admin page after login.
      },
      (error) => {
        // Error show message if login is not valid.
        this.isSubmitting = false;// Re-enable button.
        this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
      }
    );
  }

}
