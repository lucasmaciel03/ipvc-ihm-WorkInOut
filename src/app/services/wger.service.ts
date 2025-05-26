import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Exercise, Muscle } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class WgerService {
  private apiUrl = 'https://wger.de/api/v2';
  private apiKey = '6396d75c9dd5465cd42d67e2f98428856d800f97';
  private language = 'pt'; // Default to Portuguese

  constructor(private http: HttpClient) {
    console.log('WgerService initialized with language:', this.language);
  }

  // Set up headers with the API key for authentication and language preference
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${this.apiKey}`,
      'Accept-Language': this.language
    });
  }

  // Set the language for API requests
  setLanguage(lang: string) {
    this.language = lang;
    console.log('Language changed to:', this.language);
  }

  // Get available languages
  getAvailableLanguages(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/language/`, { headers })
      .pipe(
        tap(response => console.log('Available languages:', response)),
        catchError(error => {
          console.error('Error fetching languages:', error);
          throw error;
        })
      );
  }

  // Get a list of exercises with language parameter
  getExercises(limit = 20): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/exercise/?language=${this.language}&limit=${limit}`, { headers })
      .pipe(
        tap(response => console.log('Exercise API response:', response)),
        map((response: any) => response.results),
        catchError(error => {
          console.error('Error fetching exercises:', error);
          throw error;
        })
      );
  }

  // Get muscles with language parameter
  getMuscles(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/muscle/?language=${this.language}`, { headers })
      .pipe(
        tap(response => console.log('Muscles API response:', response)),
        catchError(error => {
          console.error('Error fetching muscles:', error);
          throw error;
        })
      );
  }

  // Get equipment
  getEquipment(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/equipment/?language=${this.language}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching equipment:', error);
          throw error;
        })
      );
  }

  // Get detailed exercise info
  getExerciseDetails(id: number): Observable<any> {
    const headers = this.getHeaders();
    
    return this.http.get(`${this.apiUrl}/exerciseinfo/${id}/?language=${this.language}`, { headers }).pipe(
      tap(exerciseInfo => console.log('Exercise details:', exerciseInfo)),
      switchMap((exerciseInfo: any) => {
        // Get images for this exercise
        return this.getExerciseImages(id).pipe(
          map(images => {
            // Add images to exercise info
            const exerciseWithImages = { ...exerciseInfo, images };
            return exerciseWithImages;
          }),
          // If there are no images, try to add fallback images
          switchMap((exerciseWithImages: any) => {
            if (!exerciseWithImages.images || exerciseWithImages.images.length === 0) {
              return this.getMuscles().pipe(
                map((musclesResponse: any) => {
                  const muscles = musclesResponse.results;
                  return this.addFallbackImages(exerciseWithImages, muscles);
                })
              );
            }
            return of(exerciseWithImages);
          })
        );
      }),
      catchError(error => {
        console.error(`Error fetching exercise details for ID ${id}:`, error);
        throw error;
      })
    );
  }

  // Get exercise images
  getExerciseImages(exerciseId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/exerciseimage/?exercise=${exerciseId}`, { headers })
      .pipe(
        map((response: any) => response.results),
        catchError(error => {
          console.error(`Error fetching images for exercise ID ${exerciseId}:`, error);
          throw error;
        })
      );
  }

  // Add new method to get exercise videos
  getExerciseVideos(exerciseBaseId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/video/?exercise_base=${exerciseBaseId}`, { headers })
      .pipe(
        map((response: any) => response.results),
        catchError(error => {
          console.error(`Error fetching videos for exercise ID ${exerciseBaseId}:`, error);
          throw error;
        })
      );
  }

  // Get exercises with images and fallbacks
  getExercisesWithImages(limit = 10): Observable<any> {
    return this.getExercises(limit).pipe(
      switchMap(exercises => {
        if (exercises.length === 0) {
          return of([]);
        }
        
        // Load muscles first to use for fallback images
        return this.getMuscles().pipe(
          switchMap(musclesResponse => {
            const muscles = musclesResponse.results;
            
            // Create an array of observables for getting images for each exercise
            const exercisesWithImagesObservables = exercises.map((exercise: Exercise) => {
              return this.getExerciseImages(exercise.id).pipe(
                map(images => {
                  let exerciseWithImages = { ...exercise, images };
                  
                  // If no images, add fallback image based on primary muscle
                  if (!images || images.length === 0) {
                    exerciseWithImages = this.addFallbackImages(exerciseWithImages, muscles);
                  }
                  
                  return exerciseWithImages;
                })
              );
            });
            
            // Combine all observables into a single one
            return forkJoin(exercisesWithImagesObservables);
          })
        );
      })
    );
  }

  // Add fallback images to exercises based on targeted muscles
  private addFallbackImages(exercise: any, muscles: any[]): any {
    // Create fallback image based on primary muscle
    if (exercise.muscles && exercise.muscles.length > 0) {
      const primaryMuscleId = typeof exercise.muscles[0] === 'object' 
        ? exercise.muscles[0].id 
        : exercise.muscles[0];
      
      const primaryMuscle = muscles.find(m => m.id === primaryMuscleId);
      
      if (primaryMuscle && (primaryMuscle.image_url_main || primaryMuscle.image_url_secondary)) {
        exercise.images = [{
          id: 0,
          uuid: 'fallback',
          exercise: exercise.id,
          image: primaryMuscle.image_url_main || primaryMuscle.image_url_secondary,
          is_main: true,
          is_fallback: true // Mark as fallback
        }];
      }
    }
    
    // If still no images, add a generic exercise image
    if (!exercise.images || exercise.images.length === 0) {
      exercise.images = [{
        id: 0,
        uuid: 'generic-fallback',
        exercise: exercise.id,
        image: 'assets/images/generic-exercise.png', // Generic fallback
        is_main: true,
        is_fallback: true
      }];
    }
    
    return exercise;
  }

  // Create a new workout plan
  createWorkout(workoutData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/workout/`, workoutData, { headers });
  }

  // Get user's workouts
  getUserWorkouts(): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(`${this.apiUrl}/workout/`, { headers })
      .pipe(map((response: any) => response.results));
  }

  // Search exercises by name
  searchExercises(query: string, language = 'pt'): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(
        `${this.apiUrl}/exercise/search/?term=${query}&language=${language}`,
        { headers }
      )
      .pipe(map((response: any) => response.suggestions));
  }
}
