import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutVideoPage } from './workout-video.page';

describe('WorkoutVideoPage', () => {
  let component: WorkoutVideoPage;
  let fixture: ComponentFixture<WorkoutVideoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutVideoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
