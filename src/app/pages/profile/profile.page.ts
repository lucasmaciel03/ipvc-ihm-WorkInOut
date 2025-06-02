import { Component } from '@angular/core';

interface Workout {
  title: string;
  date: string;        // ISO
  duration: string;
  reps: string;
  calories: number;
  heartRate: number;
  bpm: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  workouts: Workout[] = [
    {
      title: 'Bicep Program',
      date: '2024-03-15',
      duration: '12min',
      reps: '3 x 12 reps',
      calories: 802,
      heartRate: 99,
      bpm: 18,
    },
    {
      title: 'Bicep Program',
      date: '2024-03-04',
      duration: '32min',
      reps: '3 × 12 reps',
      calories: 802,
      heartRate: 99,
      bpm: 18,
    },
    {
      title: 'Bicep Program',
      date: '2024-03-04',
      duration: '32min',
      reps: '3 × 12 reps',
      calories: 802,
      heartRate: 99,
      bpm: 18,
    },
  ];
}
