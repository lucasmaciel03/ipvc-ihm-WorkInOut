/**
 * Interface que define a estrutura de um utilizador
 * Segue o princípio de tipagem forte para garantir robustez
 */
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt?: Date;
  height?: number;
  weight?: number;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  fitnessGoals?: string[];
}
