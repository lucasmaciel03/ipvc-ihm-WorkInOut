import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  'Ganhar Músculo': {
    descricao: string;
    [key: string]: any; // Para grupos musculares
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  constructor(private http: HttpClient) {}

  getWorkoutData(): Observable<WorkoutData> {
    return this.http.get<WorkoutData>('/assets/data/ganhar_musculo.json');
  }

  getProgramsByMuscleGroup(muscleGroup: string): Observable<WorkoutProgram[]> {
    return this.getWorkoutData().pipe(
      map(data => {
        if (muscleGroup === 'all') {
          // Para 'all', concatenar todos os programas de todos os grupos musculares
          return Object.keys(data['Ganhar Músculo'])
            .filter(key => key !== 'descricao')
            .reduce((acc, key) => acc.concat(data['Ganhar Músculo'][key]), [] as WorkoutProgram[]);
        }
        return data['Ganhar Músculo'][muscleGroup] || [];
      })
    );
  }

  getAllMuscleGroups(): Observable<string[]> {
    return this.getWorkoutData().pipe(
      map(data => Object.keys(data['Ganhar Músculo']).filter(key => key !== 'descricao'))
    );
  }
}
