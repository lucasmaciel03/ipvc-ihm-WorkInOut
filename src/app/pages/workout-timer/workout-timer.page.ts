import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-workout-timer',
  templateUrl: './workout-timer.page.html',
  styleUrls: ['./workout-timer.page.scss'],
  standalone: false
})
export class WorkoutTimerPage implements OnInit, OnDestroy {

  @Input() duration: number = 60; //minutos
  totalSeconds: number = 0; 
  remainingSeconds: number = 0;
  interval: any;
  paused = false;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.totalSeconds = this.duration * 60; //converte minutos em segundos
    this.remainingSeconds = this.totalSeconds;
    this.startTimer();
  }

  ngOnDestroy(){
    clearInterval(this.interval);
  }

  get formattedTime() {
    const mins = Math.floor(this.remainingSeconds / 60).toString().padStart(2, '0');
    const secs = (this.remainingSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  get progress() {
    return (100 * (this.totalSeconds - this.remainingSeconds)) / this.totalSeconds;
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (!this.paused && this.remainingSeconds > 0) {
        this.remainingSeconds--;
      }
    }, 1000);
  }

  togglePause() {
    this.paused = !this.paused;
  }

  rewind() {
    this.remainingSeconds = Math.max(this.remainingSeconds + 10, 0);
  }

  forward() {
    this.remainingSeconds = Math.min(this.remainingSeconds - 10, this.totalSeconds);
  }

  dismiss() {
    clearInterval(this.interval);
    this.modalCtrl.dismiss();
  }

}
