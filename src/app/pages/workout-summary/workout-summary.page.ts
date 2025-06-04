import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

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

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  nextStep() {
    this.step = 2;
  }

  finish() {
    this.step = 3;
  }

  continueTraining() {
    // Fechar o modal e talvez abrir próximo exercício
    this.modalCtrl.dismiss({ continue: true });
  }

  finishSession() {
    // Finaliza e volta para o início ou dashboard
    this.modalCtrl.dismiss({ continue: false });
  }

  dismiss() {
    clearInterval(this.interval);
    this.modalCtrl.dismiss();
  }

}
