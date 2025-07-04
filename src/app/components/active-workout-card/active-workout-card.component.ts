import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WorkoutSession } from '../../core/services/workout-progress.service';

@Component({
  selector: 'app-active-workout-card',
  templateUrl: './active-workout-card.component.html',
  styleUrls: ['./active-workout-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ActiveWorkoutCardComponent {
  @Input() workout!: WorkoutSession;
  @Output() continueWorkout = new EventEmitter<WorkoutSession>();
  @Output() cancelWorkout = new EventEmitter<WorkoutSession>();

  /**
   * Formata a duração do treino em formato legível
   */
  formatDuration(seconds: number): string {
    if (!seconds) return '0m';
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Calcula há quanto tempo o treino foi iniciado
   */
  getStartedTimeText(): string {
    if (!this.workout?.startTime) return '';
    
    const now = new Date();
    const startTime = new Date(this.workout.startTime);
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else {
      return 'agora mesmo';
    }
  }

  /**
   * Emite evento para continuar o treino
   */
  onContinueClick(event: Event): void {
    event.stopPropagation();
    this.continueWorkout.emit(this.workout);
  }

  /**
   * Emite evento para cancelar o treino
   */
  onCancelClick(event: Event): void {
    event.stopPropagation();
    this.cancelWorkout.emit(this.workout);
  }
}
