import { Component } from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';


// Import the appConfig to decortae the AppComponent with meta-data
@Component({
  selector: 'app-root',
  imports: [ 
    NavComponent, 
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nfl2026';
}
