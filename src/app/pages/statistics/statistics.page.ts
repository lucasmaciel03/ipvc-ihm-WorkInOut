import { Component, OnInit } from '@angular/core';

interface Workout {
  title: string;
  duration: string;
  reps: string;
  calories: number;
  heartRate: number;
  bpm: number;
  date: Date;
}

@Component({
  selector: 'app-statistics',
  templateUrl: 'statistics.page.html',
  styleUrls: ['statistics.page.scss'],
  standalone: false,
})
export class StatisticsPage implements OnInit {
  selectedMetric: 'calories' | 'heart' | 'bpm' = 'calories';

  recentWorkouts: Workout[] = [
    {
      title: 'Chest Program',
      duration: '12min',
      reps: '3 x 12 reps',
      calories: 802,
      heartRate: 99,
      bpm: 18,
      date: new Date('2024-03-15'),
    },
    {
      title: 'Arms Program',
      duration: '12min',
      reps: '3 x 12 reps',
      calories: 802,
      heartRate: 99,
      bpm: 18,
      date: new Date('2024-03-18'),
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}