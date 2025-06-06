import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workout-timer',
  templateUrl: './workout-timer.component.html',
  styleUrls: ['./workout-timer.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class WorkoutTimerComponent implements OnInit, OnDestroy {
  @Input() duration: number = 60 * 25; // 25 minutos por padrão
  @Output() timerComplete = new EventEmitter<void>();
  
  time: string = '00:00:00';
  progress: number = 0;
  private intervalId: any;
  private currentTime: number = 0;
  isPaused: boolean = true;

  ngOnInit() {
    this.currentTime = this.duration;
    this.updateDisplay();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  toggleTimer() {
    if (this.isPaused) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  }

  private startTimer() {
    this.isPaused = false;
    this.intervalId = setInterval(() => {
      if (this.currentTime > 0) {
        this.currentTime--;
        this.updateDisplay();
        this.progress = ((this.duration - this.currentTime) / this.duration) * 100;
      } else {
        this.stopTimer();
        this.timerComplete.emit();
      }
    }, 1000);
  }

  private pauseTimer() {
    this.isPaused = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private stopTimer() {
    this.pauseTimer();
    this.currentTime = this.duration;
    this.updateDisplay();
    this.progress = 0;
  }

  skipForward() {
    this.currentTime = Math.max(0, this.currentTime - 30);
    this.updateDisplay();
    this.progress = ((this.duration - this.currentTime) / this.duration) * 100;
  }

  skipBackward() {
    this.currentTime = Math.min(this.duration, this.currentTime + 30);
    this.updateDisplay();
    this.progress = ((this.duration - this.currentTime) / this.duration) * 100;
  }

  private updateDisplay() {
    const hours = Math.floor(this.currentTime / 3600);
    const minutes = Math.floor((this.currentTime % 3600) / 60);
    const seconds = this.currentTime % 60;

    this.time = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    
    // Atualiza a variável CSS do progresso
    document.documentElement.style.setProperty(
      '--progress',
      `${((this.duration - this.currentTime) / this.duration) * 100}`
    );
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
