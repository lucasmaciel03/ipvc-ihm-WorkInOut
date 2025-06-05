import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { SummaryPage } from '../summary/summary.page';

@Component({
  selector: 'app-workout-summary',
  templateUrl: './workout-summary.page.html',
  styleUrls: ['./workout-summary.page.scss'],
  standalone:false
})
export class WorkoutSummaryPage implements OnInit {

  interval: any;
  step = 1;
  reps = 15;
  weight = 15;
  muscleGroup: string = 'Bicep';
  program : any;
  title: string = '';
  duration: number = 0;
  calories: number = 0;
  completedAt: string = '';

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.program = this.navParams.get('program');
    this.title = this.navParams.get('title');
    this.duration = this.navParams.get('duration');
    this.calories = this.navParams.get('calories');
    this.completedAt = this.navParams.get('completedAt');
  }

  nextStep() {
    this.step = 2;
  }

  finish() {
    this.step = 3;
  }

  async continueTraining() {
    let topModal = await this.modalCtrl.getTop();
    
    while (topModal) {
      await this.modalCtrl.dismiss();
      topModal = await this.modalCtrl.getTop();
    }
  }

  async finishSession() {
    await this.modalCtrl.dismiss(); // Fecha o summary modal

    // Aguarda um pouco para garantir que os modais anteriores já fecharam
    setTimeout(async () => {
      const modal = await this.modalCtrl.create({
        component: SummaryPage,
        cssClass: 'slide-in-modal final-summary-modal',
        showBackdrop: true,
        componentProps: {
          title: this.title,
          duration: this.duration,
          calories: this.calories,
          completedAt: this.completedAt,
          reps: this.reps,
          weight: this.weight,
          muscleGroup: this.muscleGroup
        }
      });
      await modal.present();
    }, 300);
  }

  dismiss() {
    clearInterval(this.interval);
    this.modalCtrl.dismiss();
  }

}
