import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { WorkoutTimerPage } from '../workout-timer/workout-timer.page';

@Component({
  selector: 'app-workout-video',
  templateUrl: './workout-video.page.html',
  styleUrls: ['./workout-video.page.scss'],
  standalone: false
})
export class WorkoutVideoPage implements OnInit {

  program : any;

  constructor(private modalCtrl: ModalController, private navParams: NavParams) {}

  ngOnInit() {
    this.program = this.navParams.get('program');
    console.log('Recebido:', this.program);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async openTimer(duration:number){
    const modal = await this.modalCtrl.create({
      component: WorkoutTimerPage,
      cssClass: 'slide-in-modal',
      showBackdrop: true,
      componentProps:{ duration }
    });

    await modal.present();
  }

  parseDuration(duration:string): number {
    return parseInt(duration)
  }

}
