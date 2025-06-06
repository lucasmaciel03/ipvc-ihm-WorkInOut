import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-workout-complete',
  templateUrl: './workout-complete.component.html',
  styleUrls: ['./workout-complete.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class WorkoutCompleteComponent {
  @Input() workoutName: string = '';
  @Output() continue = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();

  onContinue() {
    this.continue.emit();
  }

  onFinish() {
    this.finish.emit();
  }
}
