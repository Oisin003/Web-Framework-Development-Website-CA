import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoringstatsComponent } from './scoringstats.component';

describe('ScoringstatsComponent', () => {
  let component: ScoringstatsComponent;
  let fixture: ComponentFixture<ScoringstatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoringstatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoringstatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
