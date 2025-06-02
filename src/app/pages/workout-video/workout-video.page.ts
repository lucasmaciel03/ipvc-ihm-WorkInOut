import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

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

}
