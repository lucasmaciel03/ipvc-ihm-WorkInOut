import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WorkoutSession } from '../../core/services/workout-progress.service';

@Component({
  selector: 'app-pending-workout-card',
  templateUrl: './pending-workout-card.component.html',
  styleUrls: ['./pending-workout-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PendingWorkoutCardComponent {
  @Input() workout!: WorkoutSession;
  @Output() resumeWorkout = new EventEmitter<WorkoutSession>();
  @Output() deleteWorkout = new EventEmitter<WorkoutSession>();

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
   * Calcula há quanto tempo o treino foi atualizado pela última vez
   */
  getLastUpdatedText(): string {
    if (!this.workout?.lastUpdated) return '';
    
    const now = new Date();
    const lastUpdated = new Date(this.workout.lastUpdated);
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else {
      return 'agora mesmo';
    }
  }

  /**
   * Emite evento para retomar o treino
   */
  onResumeClick(event: Event): void {
    event.stopPropagation();
    this.resumeWorkout.emit(this.workout);
  }

  /**
   * Emite evento para eliminar o treino pendente
   */
  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteWorkout.emit(this.workout);
  }
}
