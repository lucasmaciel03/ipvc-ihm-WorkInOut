import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../config/app.config';

/**
 * Interface para os dados de exercícios
 */
export interface ExerciseData {
  video: string;
  average_time: string;
  equipment: string;
  equipment_image: string;
  difficulty: string;
  rating: string;
  muscles_worked: string[];
  category?: string;
}

/**
 * Serviço para gerir os dados da aplicação
 * Carrega os exercícios a partir de ficheiros JSON
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private maintenanceExercises = new BehaviorSubject<Record<string, ExerciseData>>({});
  private muscleGainExercises = new BehaviorSubject<Record<string, ExerciseData>>({});
  private weightLossExercises = new BehaviorSubject<Record<string, ExerciseData>>({});

  // Observables públicos para os exercícios
  maintenanceExercises$ = this.maintenanceExercises.asObservable();
  muscleGainExercises$ = this.muscleGainExercises.asObservable();
  weightLossExercises$ = this.weightLossExercises.asObservable();

  constructor(private http: HttpClient) {
    this.loadExercises();
  }

  /**
   * Carrega todos os exercícios dos ficheiros JSON
   */
  loadExercises(): void {
    this.loadMaintenanceExercises();
    this.loadMuscleGainExercises();
    this.loadWeightLossExercises();
  }

  /**
   * Carrega os exercícios de manutenção
   */
  private loadMaintenanceExercises(): void {
    this.http.get<{ Maintenance: Record<string, ExerciseData> }>('assets/data/maintenance-exercises.json')
      .pipe(
        map(response => response.Maintenance),
        catchError(error => {
          console.error('Erro ao carregar exercícios de manutenção:', error);
          return of({});
        })
      )
      .subscribe(exercises => {
        this.maintenanceExercises.next(exercises);
      });
  }

  /**
   * Carrega os exercícios de ganho muscular
   */
  private loadMuscleGainExercises(): void {
    this.http.get<{ 'Muscle Gain': Record<string, ExerciseData> }>('assets/data/muscle-gain-exercises.json')
      .pipe(
        map(response => response['Muscle Gain']),
        catchError(error => {
          console.error('Erro ao carregar exercícios de ganho muscular:', error);
          return of({});
        })
      )
      .subscribe(exercises => {
        this.muscleGainExercises.next(exercises);
      });
  }

  /**
   * Carrega os exercícios de perda de peso
   */
  private loadWeightLossExercises(): void {
    this.http.get<{ 'Weight Loss': Record<string, ExerciseData> }>('assets/data/weight-loss-exercises.json')
      .pipe(
        map(response => response['Weight Loss']),
        catchError(error => {
          console.error('Erro ao carregar exercícios de perda de peso:', error);
          return of({});
        })
      )
      .subscribe(exercises => {
        this.weightLossExercises.next(exercises);
      });
  }

  /**
   * Obtém todos os exercícios combinados
   * @returns Observable com todos os exercícios
   */
  getAllExercises(): Observable<Record<string, ExerciseData>> {
    return new Observable(observer => {
      const allExercises: Record<string, ExerciseData> = {};
      
      // Utiliza forkJoin para combinar os três observables
      forkJoin([
        this.maintenanceExercises$,
        this.muscleGainExercises$,
        this.weightLossExercises$
      ]).subscribe(([maintenance, muscleGain, weightLoss]) => {
        // Adiciona os exercícios de manutenção
        Object.entries(maintenance).forEach(([name, data]) => {
          allExercises[name] = { ...data, category: 'Manutenção' };
        });
        
        // Adiciona os exercícios de ganho muscular
        Object.entries(muscleGain).forEach(([name, data]) => {
          allExercises[name] = { ...data, category: 'Ganho Muscular' };
        });
        
        // Adiciona os exercícios de perda de peso
        Object.entries(weightLoss).forEach(([name, data]) => {
          allExercises[name] = { ...data, category: 'Perda de Peso' };
        });
        
        observer.next(allExercises);
        observer.complete();
      });
    });
  }

  /**
   * Obtém exercícios filtrados por músculo trabalhado
   * @param muscle Nome do músculo
   * @returns Exercícios que trabalham o músculo especificado
   */
  getExercisesByMuscle(muscle: string): Observable<Record<string, ExerciseData>> {
    return this.getAllExercises().pipe(
      map(exercises => {
        const filtered: Record<string, ExerciseData> = {};
        
        Object.entries(exercises).forEach(([name, data]) => {
          if (data.muscles_worked.some(m => m.toLowerCase().includes(muscle.toLowerCase()))) {
            filtered[name] = data;
          }
        });
        
        return filtered;
      })
    );
  }

  /**
   * Obtém exercícios filtrados por dificuldade
   * @param difficulty Nível de dificuldade
   * @returns Exercícios com a dificuldade especificada
   */
  getExercisesByDifficulty(difficulty: string): Observable<Record<string, ExerciseData>> {
    return this.getAllExercises().pipe(
      map(exercises => {
        const filtered: Record<string, ExerciseData> = {};
        
        Object.entries(exercises).forEach(([name, data]) => {
          if (data.difficulty.toLowerCase().includes(difficulty.toLowerCase())) {
            filtered[name] = data;
          }
        });
        
        return filtered;
      })
    );
  }

  /**
   * Obtém exercícios filtrados por equipamento
   * @param equipment Nome do equipamento
   * @returns Exercícios que utilizam o equipamento especificado
   */
  getExercisesByEquipment(equipment: string): Observable<Record<string, ExerciseData>> {
    return this.getAllExercises().pipe(
      map(exercises => {
        const filtered: Record<string, ExerciseData> = {};
        
        Object.entries(exercises).forEach(([name, data]) => {
          if (data.equipment.toLowerCase().includes(equipment.toLowerCase())) {
            filtered[name] = data;
          }
        });
        
        return filtered;
      })
    );
  }
}
