import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WorkoutProgressService, WorkoutSession } from '../../core/services/workout-progress.service';

@Component({
  selector: 'app-workout-summary',
  templateUrl: './workout-summary.component.html',
  styleUrls: ['./workout-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class WorkoutSummaryComponent implements OnInit {
  @Output() dismiss = new EventEmitter<void>();
  @Input() workoutId?: string;
  
  currentWorkout: WorkoutSession | null = null;
  workoutDate: string = '';
  stats = {
    calories: 0,
    time: 0,
    completionRate: 0,
    exercisesCompleted: 0,
    totalExercises: 0
  };

  recentWorkouts: any[] = [];
  
  constructor(private workoutProgressService: WorkoutProgressService) {}
  
  ngOnInit() {
    this.loadWorkoutData();
    this.loadRecentWorkouts();
  }
  
  /**
   * Carrega os dados do treino atual para o resumo
   */
  private loadWorkoutData() {
    // Se tiver um ID específico, buscar do histórico
    if (this.workoutId) {
      const history = this.workoutProgressService.getWorkoutHistory();
      this.currentWorkout = history.find(w => w.id === this.workoutId) || null;
    }
    
    // Se não encontrou por ID ou não tinha ID, usar o último treino finalizado
    if (!this.currentWorkout) {
      const history = this.workoutProgressService.getWorkoutHistory();
      this.currentWorkout = history.length > 0 ? history[history.length - 1] : null;
    }
    
    if (this.currentWorkout) {
      // Formatar a data
      const date = new Date(this.currentWorkout.endTime || this.currentWorkout.startTime);
      this.workoutDate = this.formatDate(date);
      
      // Calcular estatísticas
      this.stats = {
        calories: this.currentWorkout.caloriesEstimated,
        time: Math.floor(this.currentWorkout.duration / 60), // Converter segundos para minutos
        completionRate: this.calculateCompletionRate(),
        exercisesCompleted: this.currentWorkout.completedExercises,
        totalExercises: this.currentWorkout.totalExercises
      };
    }
  }
  
  /**
   * Carrega os treinos recentes do histórico
   */
  private loadRecentWorkouts() {
    const history = this.workoutProgressService.getWorkoutHistory();
    
    // Pegar os últimos 5 treinos (excluindo o atual se estiver no histórico)
    this.recentWorkouts = history
      .filter(w => !this.currentWorkout || w.id !== this.currentWorkout.id)
      .slice(-5)
      .reverse()
      .map(workout => ({
        date: this.formatDate(new Date(workout.endTime || workout.startTime)),
        duration: `${Math.floor(workout.duration / 60)}min`,
        programName: workout.programName,
        calories: workout.caloriesEstimated,
        completionRate: this.calculateCompletionRate(workout),
        exercisesCompleted: `${workout.completedExercises}/${workout.totalExercises}`
      }));
  }
  
  /**
   * Calcula a taxa de conclusão do treino
   */
  private calculateCompletionRate(workout?: WorkoutSession): number {
    const w = workout || this.currentWorkout;
    if (!w) return 0;
    
    return Math.round((w.completedExercises / w.totalExercises) * 100);
  }
  
  /**
   * Formata a data para exibição
   */
  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = this.getMonthName(date.getMonth());
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  }
  
  /**
   * Retorna o nome do mês em português
   */
  private getMonthName(monthIndex: number): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return months[monthIndex];
  }

  onBackClick() {
    this.dismiss.emit();
  }
  
  /**
   * Manipula o clique no botão de partilha
   */
  onMoreClick() {
    // Implementação futura: partilhar o resumo do treino
    console.log('Partilhar resumo do treino');
  }
  
  /**
   * Fecha o resumo do treino
   */
  onDismiss() {
    this.dismiss.emit();
  }

  /**
   * Retorna a imagem do programa ou uma imagem padrão caso não exista
   * @returns URL da imagem para usar como fundo do resumo
   */
  getProgramImage(): string {
    if (this.currentWorkout?.programImage) {
      return this.currentWorkout.programImage;
    }
    
    // Imagens padrão baseadas em categorias comuns
    const defaultImages = {
      'ficar em forma': '/assets/images/programas/funcional_programa.png',
      'perder peso': '/assets/images/programas/perder_peso_programa.png',
      'ganhar massa': '/assets/images/programas/massa_programa.png',
      'tonificar': '/assets/images/programas/tonificar_programa.png'
    };
    
    // Verificar se o nome do programa contém alguma das categorias conhecidas
    if (this.currentWorkout?.programName) {
      const nomeLowerCase = this.currentWorkout.programName.toLowerCase();
      for (const [categoria, imagem] of Object.entries(defaultImages)) {
        if (nomeLowerCase.includes(categoria)) {
          return imagem;
        }
      }
    }
    
    // Imagem padrão se não houver outras opções
    return '/assets/images/workout-complete.jpg';
  }
}
