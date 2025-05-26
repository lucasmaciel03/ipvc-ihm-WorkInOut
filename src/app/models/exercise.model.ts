export interface Exercise {
  id: number;
  name: string;
  description: string;
  category: number | Category;
  muscles: number[] | Muscle[];
  muscles_secondary: number[] | Muscle[];
  equipment: number[] | Equipment[];
  language: number | Language;
  uuid: string;
  images?: ExerciseImage[];
  videos?: ExerciseVideo[];
}

// Rename ExerciseInfo to ExerciseDetail to match our naming convention
export interface ExerciseDetail {
  id: number;
  name: string;
  description: string;
  category: Category;
  muscles: Muscle[];
  muscles_secondary: Muscle[];
  equipment: Equipment[];
  language: Language;
  images: ExerciseImage[];
}

export interface ExerciseImage {
  id: number;
  uuid: string;
  exercise: number;
  image: string;
  is_main: boolean;
}

export interface ExerciseVideo {
  id: number;
  uuid: string;
  exercise_base: number;
  video: string;
  is_main: boolean;
  title?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Muscle {
  id: number;
  name: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
}

export interface Equipment {
  id: number;
  name: string;
}

export interface Language {
  id: number;
  short_name: string;
  full_name: string;
}

export interface Workout {
  id: number;
  creation_date: string;
  name: string;
  description: string;
}
