export interface User {
  name: string;
  email: string;
  password: string;
  objective: 'perder-peso' | 'ganhar-musculo' | 'ficar-em-forma';
  height: number; // em cm
  weight: number; // em kg
  age: number;
  gender: 'masculino' | 'feminino' | 'outro';
}

export interface RegisterForm {
  step: number;
  userData: User;
}
