import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutTimerPage } from './workout-timer.page';

describe('WorkoutTimerPage', () => {
  let component: WorkoutTimerPage;
  let fixture: ComponentFixture<WorkoutTimerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutTimerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
