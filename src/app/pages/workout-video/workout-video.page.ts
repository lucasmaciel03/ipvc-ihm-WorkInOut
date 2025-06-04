import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WorkoutTimerPage } from '../workout-timer/workout-timer.page';

@Component({
  selector: 'app-workout-video',
  templateUrl: './workout-video.page.html',
  styleUrls: ['./workout-video.page.scss'],
  standalone: false
})
export class WorkoutVideoPage implements OnInit {

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async openTimer(duration:number){
    const modal = await this.modalCtrl.create({
      component: WorkoutTimerPage,
      cssClass: 'slide-in-modal',
      showBackdrop: true,
      componentProps:{duration}
    });

    await modal.present();
  }

}
