import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

export interface WorkoutProgram {
  nome_programa: string;
  imagem_programa: string;
  descricao: string;
  tempo_total: string;
  total_exercicios: number;
  calorias_estimadas: number;
  tags: string[];
  pre_requisitos: {
    nivel_minimo: string;
    equipamentos_necessarios: string[];
    conhecimento_previo: string[];
  };
  exercicios: {
    nome: string;
    video: string;
    tempo_medio: string;
    equipamentos: string[];
    imagem_equipamentos: string[];
    dificuldade: string;
    avaliacao: string;
    musculos_trabalhados: string[];
  }[];
}

export interface WorkoutData {
  [category: string]: {
    descricao: string;
    [key: string]: any; // Para grupos musculares
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  // Mapeamento de objetivos para ficheiros JSON
  private readonly goalToFileMap: Record<string, string> = {
    'gain_muscle': 'ganhar_musculo.json',
    'lose_weight': 'perder_peso.json',
    'improve_fitness': 'ficar_em_forma.json'
  };

  // Mapeamento de objetivos para categorias nos ficheiros JSON
  private readonly goalToCategoryMap: Record<string, string> = {
    'gain_muscle': 'Ganhar Músculo',
    'lose_weight': 'Perder Peso',
    'improve_fitness': 'Ficar em Forma'
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtém o objetivo atual do utilizador
   * @returns O objetivo do utilizador ou 'gain_muscle' como padrão
   */
  private getUserGoal(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.primaryGoal || 'gain_muscle';
  }

  /**
   * Obtém o nome do ficheiro JSON com base no objetivo do utilizador
   * @returns Nome do ficheiro JSON
   */
  private getJsonFileName(): string {
    const userGoal = this.getUserGoal();
    return this.goalToFileMap[userGoal] || 'ganhar_musculo.json';
  }

  /**
   * Obtém a categoria principal no ficheiro JSON com base no objetivo do utilizador
   * @returns Nome da categoria
   */
  private getMainCategory(): string {
    const userGoal = this.getUserGoal();
    return this.goalToCategoryMap[userGoal] || 'Ganhar Músculo';
  }

  /**
   * Carrega os dados de treino do ficheiro JSON correto com base no objetivo do utilizador
   * @returns Observable com os dados de treino
   */
  getWorkoutData(): Observable<WorkoutData> {
    const fileName = this.getJsonFileName();
    return this.http.get<WorkoutData>(`/assets/data/${fileName}`);
  }

  /**
   * Obtém programas de treino por grupo muscular
   * @param muscleGroup Grupo muscular ou 'all' para todos
   * @returns Observable com os programas de treino
   */
  getProgramsByMuscleGroup(muscleGroup: string): Observable<WorkoutProgram[]> {
    return this.getWorkoutData().pipe(
      map(data => {
        const category = this.getMainCategory();
        
        if (muscleGroup === 'all') {
          // Para 'all', concatenar todos os programas de todos os grupos musculares
          return Object.keys(data[category])
            .filter(key => key !== 'descricao')
            .reduce((acc, key) => acc.concat(data[category][key]), [] as WorkoutProgram[]);
        }
        return data[category][muscleGroup] || [];
      })
    );
  }

  /**
   * Obtém todos os grupos musculares disponíveis
   * @returns Observable com os grupos musculares
   */
  getAllMuscleGroups(): Observable<string[]> {
    return this.getWorkoutData().pipe(
      map(data => {
        const category = this.getMainCategory();
        return Object.keys(data[category]).filter(key => key !== 'descricao');
      })
    );
  }
}
