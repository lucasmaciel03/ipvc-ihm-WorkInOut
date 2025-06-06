/**
 * Interface que define a estrutura de um exercício
 */
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
}

/**
 * Interface que define a estrutura de um treino
 */
export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  duration?: number;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  category?: WorkoutCategory;
  difficulty?: 'iniciante' | 'intermédio' | 'avançado';
}

/**
 * Enum para categorias de treinos
 */
export enum WorkoutCategory {
  FORÇA = 'força',
  CARDIO = 'cardio',
  FLEXIBILIDADE = 'flexibilidade',
  HIIT = 'hiit',
  FUNCIONAL = 'funcional',
  PERSONALIZADO = 'personalizado'
}
