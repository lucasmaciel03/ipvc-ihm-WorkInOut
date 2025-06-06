import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-workout-summary',
  templateUrl: './workout-summary.component.html',
  styleUrls: ['./workout-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class WorkoutSummaryComponent {
  @Output() dismiss = new EventEmitter<void>();
  // Mock data
  workoutDate: string = '15 Março 2024';
  stats = {
    calories: 138,
    time: 47,
    heartRate: 99,
    bpm: 18,
    sets: '3 x 12 reps'
  };

  recentWorkouts = [
    {
      date: '15 Março 2024',
      duration: '12min',
      sets: '3 x 12 reps',
      calories: 802,
      heartRate: 99,
      bpm: 18
    },
    {
      date: '04 Março 2024',
      duration: '32min',
      sets: '3 x 12 reps',
      calories: 750,
      heartRate: 95,
      bpm: 16
    }
  ];

  onBackClick() {
    this.dismiss.emit();
  }

  onMoreClick() {
    // Implementar ação de mais opções
  }
}
