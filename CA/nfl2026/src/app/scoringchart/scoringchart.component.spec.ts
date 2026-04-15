import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ScoringchartComponent } from './scoringchart.component';

describe('ScoringchartComponent', () => {
  let component: ScoringchartComponent;
  let fixture: ComponentFixture<ScoringchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoringchartComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoringchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
