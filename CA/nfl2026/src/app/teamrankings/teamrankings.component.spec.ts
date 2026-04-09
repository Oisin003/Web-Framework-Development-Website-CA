import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamrankingsComponent } from './teamrankings.component';

describe('TeamrankingsComponent', () => {
  let component: TeamrankingsComponent;
  let fixture: ComponentFixture<TeamrankingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamrankingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamrankingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
