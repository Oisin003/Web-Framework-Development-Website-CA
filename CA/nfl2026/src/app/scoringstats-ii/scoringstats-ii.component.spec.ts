import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoringstatsIIComponent } from './scoringstats-ii.component';

describe('ScoringstatsIIComponent', () => {
  let component: ScoringstatsIIComponent;
  let fixture: ComponentFixture<ScoringstatsIIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoringstatsIIComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoringstatsIIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
