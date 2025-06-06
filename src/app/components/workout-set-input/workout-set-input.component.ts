import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

export interface WorkoutSet {
  repetitions: number;
  weight: number;
}

type InputStep = 'sets' | 'reps-weight';

@Component({
  selector: 'app-workout-set-input',
  templateUrl: './workout-set-input.component.html',
  styleUrls: ['./workout-set-input.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class WorkoutSetInputComponent {
  @Output() setCompleted = new EventEmitter<WorkoutSet>();
  @Output() dismissed = new EventEmitter<void>();

  currentStep: InputStep = 'sets';
  totalSets: number = 3;
  currentSet: number = 1;
  currentRepetitions: number = 15;
  currentWeight: number = 10;
  isVisible: boolean = false;
  completedSets: WorkoutSet[] = [];

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
    this.dismissed.emit();
  }

  onContinue() {
    if (this.currentStep === 'sets') {
      this.currentStep = 'reps-weight';
      return;
    }

    this.completedSets.push({
      repetitions: this.currentRepetitions,
      weight: this.currentWeight
    });

    if (this.currentSet < this.totalSets) {
      this.currentSet++;
      // Mantém os valores da série anterior para facilitar
    } else {
      // Todas as séries foram completadas
      this.setCompleted.emit({
        repetitions: this.currentRepetitions,
        weight: this.currentWeight
      });
      this.hide();
    }
  }

  updateRepetitions(value: number) {
    this.currentRepetitions = Math.max(1, Math.min(50, value));
  }

  updateWeight(value: number) {
    this.currentWeight = Math.max(0, Math.min(200, value));
  }

  updateTotalSets(value: number) {
    this.totalSets = Math.max(1, Math.min(10, value));
  }
}
