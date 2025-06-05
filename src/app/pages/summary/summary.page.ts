import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

interface Session {
  date: string;
  calories: number;
  heart: number;
  bpmRest: number;
}

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
  standalone: false,
})

export class SummaryPage implements OnInit {
  sessions: Session[] = [
    { date: '2024-03-15', calories: 802, heart: 99, bpmRest: 18 },
    { date: '2024-03-04', calories: 755, heart: 90, bpmRest: 20 },
  ];

  showMore = false;

  constructor(private navParams: NavParams, private modalCtrl: ModalController) {}

  title = '';
  duration = 0;
  calories = 0;
  completedAt = '';
  reps = 0;
  weight = 0;
  muscleGroup = '';

  ngOnInit() {
    this.title = this.navParams.get('title') ?? '';
    this.duration = this.navParams.get('duration') ?? 0;
    this.calories = this.navParams.get('calories') ?? 0;
    this.completedAt = this.navParams.get('completedAt') ?? new Date().toISOString();
    this.reps = this.navParams.get('reps') ?? 0;
    this.weight = this.navParams.get('weight') ?? 0;
    this.muscleGroup = this.navParams.get('muscleGroup') ?? '';

    const newSession: Session = {
      date: this.completedAt,
      calories: this.calories,
      heart: Math.floor(Math.random() * 30) + 90,
      bpmRest: Math.floor(Math.random() * 10) + 15,
    };

    this.sessions.unshift(newSession);
  }

  toggleMore(): void {
    this.showMore = !this.showMore;
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
