import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkoutProgram } from '../../services/workout.service';

export interface ExerciseProgress {
  nome: string;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

export interface WorkoutSession {
  id: string;
  programId: string;
  programName: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  exercisesProgress: ExerciseProgress[];
  totalExercises: number;
  completedExercises: number;
  caloriesEstimated: number;
  duration: number; // em segundos
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutProgressService {
  private readonly WORKOUT_HISTORY_KEY = 'workinout_workout_history';
  private readonly CURRENT_WORKOUT_KEY = 'workinout_current_workout';
  
  private currentWorkoutSubject = new BehaviorSubject<WorkoutSession | null>(null);
  public currentWorkout$ = this.currentWorkoutSubject.asObservable();

  constructor() {
    // Verificar se há um treino em andamento ao inicializar
    this.loadCurrentWorkout();
  }

  /**
   * Carrega o treino atual do localStorage
   */
  private loadCurrentWorkout(): void {
    const currentWorkoutData = localStorage.getItem(this.CURRENT_WORKOUT_KEY);
    if (currentWorkoutData) {
      const workout = JSON.parse(currentWorkoutData);
      this.currentWorkoutSubject.next(workout);
    }
  }

  /**
   * Obtém o histórico de treinos do localStorage
   */
  getWorkoutHistory(): WorkoutSession[] {
    const historyData = localStorage.getItem(this.WORKOUT_HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : [];
  }

  /**
   * Salva o histórico de treinos no localStorage
   */
  private saveWorkoutHistory(history: WorkoutSession[]): void {
    localStorage.setItem(this.WORKOUT_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Inicia um novo treino
   */
  startWorkout(program: WorkoutProgram): WorkoutSession {
    // Verificar se já existe um treino em andamento
    if (this.currentWorkoutSubject.value) {
      throw new Error('Já existe um treino em andamento. Termine-o antes de iniciar outro.');
    }

    // Criar exercícios para acompanhamento
    const exercisesProgress: ExerciseProgress[] = program.exercicios.map(ex => ({
      nome: ex.nome,
      completed: false
    }));

    // Criar nova sessão de treino
    const newWorkout: WorkoutSession = {
      id: this.generateWorkoutId(),
      programId: program.nome_programa,
      programName: program.nome_programa,
      startTime: new Date(),
      completed: false,
      exercisesProgress: exercisesProgress,
      totalExercises: program.exercicios.length,
      completedExercises: 0,
      caloriesEstimated: program.calorias_estimadas,
      duration: 0
    };

    // Salvar no localStorage e atualizar o subject
    localStorage.setItem(this.CURRENT_WORKOUT_KEY, JSON.stringify(newWorkout));
    this.currentWorkoutSubject.next(newWorkout);

    return newWorkout;
  }

  /**
   * Marca um exercício como iniciado
   */
  startExercise(exerciseName: string): void {
    const currentWorkout = this.currentWorkoutSubject.value;
    if (!currentWorkout) {
      throw new Error('Nenhum treino em andamento.');
    }

    const updatedWorkout = { ...currentWorkout };
    const exerciseIndex = updatedWorkout.exercisesProgress.findIndex(
      ex => ex.nome === exerciseName
    );

    if (exerciseIndex === -1) {
      throw new Error('Exercício não encontrado no treino atual.');
    }

    // Marcar exercício como iniciado
    updatedWorkout.exercisesProgress[exerciseIndex] = {
      ...updatedWorkout.exercisesProgress[exerciseIndex],
      startTime: new Date()
    };

    // Atualizar localStorage e subject
    localStorage.setItem(this.CURRENT_WORKOUT_KEY, JSON.stringify(updatedWorkout));
    this.currentWorkoutSubject.next(updatedWorkout);
  }

  /**
   * Marca um exercício como concluído
   */
  completeExercise(exerciseName: string): void {
    const currentWorkout = this.currentWorkoutSubject.value;
    if (!currentWorkout) {
      throw new Error('Nenhum treino em andamento.');
    }

    const updatedWorkout = { ...currentWorkout };
    const exerciseIndex = updatedWorkout.exercisesProgress.findIndex(
      ex => ex.nome === exerciseName
    );

    if (exerciseIndex === -1) {
      throw new Error('Exercício não encontrado no treino atual.');
    }

    // Marcar exercício como concluído
    updatedWorkout.exercisesProgress[exerciseIndex] = {
      ...updatedWorkout.exercisesProgress[exerciseIndex],
      completed: true,
      endTime: new Date()
    };

    // Atualizar contador de exercícios concluídos
    updatedWorkout.completedExercises = updatedWorkout.exercisesProgress.filter(
      ex => ex.completed
    ).length;

    // Atualizar localStorage e subject
    localStorage.setItem(this.CURRENT_WORKOUT_KEY, JSON.stringify(updatedWorkout));
    this.currentWorkoutSubject.next(updatedWorkout);
  }

  /**
   * Finaliza o treino atual
   */
  finishWorkout(forceFinish: boolean = false): WorkoutSession {
    const currentWorkout = this.currentWorkoutSubject.value;
    if (!currentWorkout) {
      throw new Error('Nenhum treino em andamento para finalizar.');
    }

    // Verificar se todos os exercícios foram concluídos
    const allExercisesCompleted = currentWorkout.completedExercises === currentWorkout.totalExercises;
    
    if (!allExercisesCompleted && !forceFinish) {
      throw new Error('INCOMPLETE_WORKOUT');
    }

    // Finalizar o treino
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(currentWorkout.startTime).getTime()) / 1000);
    
    const finishedWorkout: WorkoutSession = {
      ...currentWorkout,
      endTime,
      completed: true,
      duration
    };

    // Adicionar ao histórico
    const history = this.getWorkoutHistory();
    history.push(finishedWorkout);
    this.saveWorkoutHistory(history);

    // Limpar treino atual
    localStorage.removeItem(this.CURRENT_WORKOUT_KEY);
    this.currentWorkoutSubject.next(null);

    return finishedWorkout;
  }

  /**
   * Cancela o treino atual sem salvar no histórico
   */
  cancelWorkout(): void {
    localStorage.removeItem(this.CURRENT_WORKOUT_KEY);
    this.currentWorkoutSubject.next(null);
  }

  /**
   * Verifica se há um treino em andamento
   */
  hasActiveWorkout(): boolean {
    return this.currentWorkoutSubject.value !== null;
  }

  /**
   * Obtém o treino atual
   */
  getCurrentWorkout(): WorkoutSession | null {
    return this.currentWorkoutSubject.value;
  }

  /**
   * Gera um ID único para o treino
   */
  private generateWorkoutId(): string {
    return 'workout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
