import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
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

  constructor(private modalCtrl: ModalController, private navCtrl: NavController) { }

  ngOnInit() {
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
        showBackdrop: true
      });
      await modal.present();
    }, 300);
  }

  dismiss() {
    clearInterval(this.interval);
    this.modalCtrl.dismiss();
  }

}
