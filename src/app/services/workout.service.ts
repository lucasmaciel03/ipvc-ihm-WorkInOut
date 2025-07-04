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
   * Obtém todos os programas de todos os objetivos (ficheiros JSON)
   * @returns Observable com todos os programas de treino
   */
  getAllPrograms(): Observable<WorkoutProgram[]> {
    // Lista de todos os ficheiros JSON
    const files = ['ganhar_musculo.json', 'perder_peso.json', 'ficar_em_forma.json'];
    
    // Criar um array de observables, um para cada ficheiro
    const observables = files.map(file => 
      this.http.get<WorkoutData>(`/assets/data/${file}`).pipe(
        map(data => {
          // Para cada ficheiro, extrair todos os programas de todos os grupos musculares
          const category = Object.keys(data)[0]; // Primeira categoria no ficheiro (ex: "Ganhar Músculo")
          return Object.keys(data[category])
            .filter(key => key !== 'descricao')
            .reduce((acc, key) => acc.concat(data[category][key]), [] as WorkoutProgram[]);
        })
      )
    );
    
    // Combinar todos os observables em um único observable que emite um array com todos os programas
    return new Observable<WorkoutProgram[]>(observer => {
      let allPrograms: WorkoutProgram[] = [];
      let completed = 0;
      
      observables.forEach(obs => {
        obs.subscribe({
          next: (programs) => {
            allPrograms = [...allPrograms, ...programs];
            completed++;
            
            if (completed === files.length) {
              observer.next(allPrograms);
              observer.complete();
            }
          },
          error: (err) => observer.error(err)
        });
      });
    });
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
  
  // Chave para armazenar programas salvos no localStorage
  private readonly SAVED_PROGRAMS_KEY = 'savedWorkoutPrograms';
  
  /**
   * Salva um programa como favorito
   * @param program Programa a ser salvo
   * @returns true se o programa foi salvo com sucesso, false se já existia
   */
  saveProgram(program: WorkoutProgram): boolean {
    const savedPrograms = this.getSavedPrograms();
    
    // Verificar se o programa já está salvo
    const alreadySaved = savedPrograms.some(p => 
      p.nome_programa === program.nome_programa && 
      p.descricao === program.descricao
    );
    
    if (alreadySaved) {
      return false;
    }
    
    // Adicionar programa à lista e salvar
    savedPrograms.push(program);
    localStorage.setItem(this.SAVED_PROGRAMS_KEY, JSON.stringify(savedPrograms));
    return true;
  }
  
  /**
   * Remove um programa dos favoritos
   * @param program Programa a ser removido
   * @returns true se o programa foi removido com sucesso, false se não existia
   */
  removeProgram(program: WorkoutProgram): boolean {
    const savedPrograms = this.getSavedPrograms();
    
    // Encontrar o índice do programa
    const index = savedPrograms.findIndex(p => 
      p.nome_programa === program.nome_programa && 
      p.descricao === program.descricao
    );
    
    if (index === -1) {
      return false;
    }
    
    // Remover programa e salvar
    savedPrograms.splice(index, 1);
    localStorage.setItem(this.SAVED_PROGRAMS_KEY, JSON.stringify(savedPrograms));
    return true;
  }
  
  /**
   * Verifica se um programa está salvo como favorito
   * @param program Programa a verificar
   * @returns true se o programa está salvo, false caso contrário
   */
  isProgramSaved(program: WorkoutProgram): boolean {
    const savedPrograms = this.getSavedPrograms();
    return savedPrograms.some(p => 
      p.nome_programa === program.nome_programa && 
      p.descricao === program.descricao
    );
  }
  
  /**
   * Obtém todos os programas salvos
   * @returns Array com os programas salvos
   */
  getSavedPrograms(): WorkoutProgram[] {
    const savedData = localStorage.getItem(this.SAVED_PROGRAMS_KEY);
    return savedData ? JSON.parse(savedData) : [];
  }
}
