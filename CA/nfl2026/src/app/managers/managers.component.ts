import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

// Shape of one manager row returned from the API.
interface ManagerRow {
  name: string;
}

@Component({
  selector: 'app-managers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './managers.component.html',
  styleUrl: './managers.component.css'
})
export class ManagersComponent implements OnInit {
  // Managers shown in the table.
  managers: ManagerRow[] = [];

  constructor(private dataService: DataService) { }

  // Runs when the component loads.
  ngOnInit(): void {
    this.loadManagers();
  }

  // Fetch manager data and sort names A-Z.
  private loadManagers(): void {
    this.dataService.getData('managers').subscribe(
      (response) => {
        this.managers = (response.data || []).sort((a: ManagerRow, b: ManagerRow) =>
          (a.name || '').localeCompare(b.name || '')
        );
      },
      (error) => {
        // Log the error 
        console.error('Error fetching the managers information:', error);
      }
    );
  }
}