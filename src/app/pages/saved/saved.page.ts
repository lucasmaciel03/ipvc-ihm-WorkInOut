import { Component } from '@angular/core';

interface Workout {
  title: string;
  date: string;
  duration: string;
  reps: string;
  calories: number;
  heartRate: number;
  bpm: number;
}

interface Article {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-saved',
  templateUrl: './saved.page.html',
  styleUrls: ['./saved.page.scss'],
  standalone: false,
})
export class SavedPage {
  selectedTab: 'workouts' | 'articles' = 'workouts';

  savedWorkouts: Workout[] = [
    {
      title: 'Bicep Program',
      date: '2024-03-15',
      duration: '12min',
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
      calories: 755,
      heartRate: 90,
      bpm: 20,
    },
  ];

  savedArticles: Article[] = [
    { title: '5 Tips to Improve Your Bench Press', subtitle: 'Strength • 8 min read' },
    { title: 'How Cardio Boosts Muscle Recovery',   subtitle: 'Recovery • 5 min read' },
  ];
}
