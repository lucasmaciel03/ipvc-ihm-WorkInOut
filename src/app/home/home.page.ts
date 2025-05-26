import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule, LoadingController } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { WgerService } from "../services/wger.service";
import { Exercise, Muscle } from "../models/exercise.model";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    HttpClientModule,
  ],
})
export class HomePage implements OnInit {
  exercises: any[] = [];
  muscles: any[] = [];
  equipment: any[] = [];
  loading: boolean = false;
  apiError: string | null = null;
  searchTerm: string = '';
  currentLanguage: string = 'pt'; // Default to Portuguese

  constructor(
    private wgerService: WgerService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    // Set language and check available languages
    this.wgerService.setLanguage(this.currentLanguage);
    
    // Get available languages to verify what's available
    this.wgerService.getAvailableLanguages().subscribe({
      next: (data: any) => {
        console.log('Available languages:', data);
        // Check for Portuguese options
        if (data && data.results) {
          const languages = data.results;
          console.log('Language options:', languages);
          
          // Look for Portuguese variant
          const portugueseLanguage = languages.find((lang: any) => 
            lang.short_name === 'pt' || 
            lang.short_name === 'pt-pt' || 
            lang.short_name === 'pt-br' ||
            (lang.full_name && lang.full_name.toLowerCase().includes('portug'))
          );
          
          if (portugueseLanguage) {
            console.log('Found Portuguese language:', portugueseLanguage);
            this.currentLanguage = portugueseLanguage.short_name;
            this.wgerService.setLanguage(this.currentLanguage);
          }
        }
        // Load data after language check
        this.loadData();
      },
      error: (error: any) => {
        console.error('Error fetching languages:', error);
        // Still try to load data with default language
        this.loadData();
      }
    });
  }

  async loadData() {
    const loading = await this.loadingController.create({
      message: "A carregar dados da API Wger...",
      spinner: "crescent",
    });
    await loading.present();

    this.loading = true;
    this.apiError = null;

    // Fetch muscles
    this.wgerService.getMuscles().subscribe({
      next: (data) => {
        this.muscles = data.results;
        console.log("Músculos:", this.muscles);

        // Fetch exercises
        this.wgerService.getExercises(12).subscribe({
          next: (exercises) => {
            this.exercises = exercises;
            console.log("Exercícios:", this.exercises);
            
            // Log some exercise data to verify language
            if (exercises.length > 0) {
              console.log("Exemplo de nome de exercício:", exercises[0].name);
              console.log("Exemplo de descrição:", exercises[0].description);
            }

            // Fetch equipment
            this.wgerService.getEquipment().subscribe({
              next: (equipment) => {
                this.equipment = equipment.results;
                this.loading = false;
                loading.dismiss();
              },
              error: (error) => {
                this.handleApiError(error, loading);
              },
            });
          },
          error: (error) => {
            this.handleApiError(error, loading);
          },
        });
      },
      error: (error) => {
        this.handleApiError(error, loading);
      },
    });
  }

  // Change language and reload data
  changeLanguage() {
    console.log('Changing language to:', this.currentLanguage);
    this.wgerService.setLanguage(this.currentLanguage);
    this.loadData();
  }

  handleApiError(error: any, loading: HTMLIonLoadingElement) {
    console.error("API Error:", error);
    this.apiError = error.message || "Unknown error occurred while fetching data";
    this.loading = false;
    loading.dismiss();
  }

  // Get muscle name by ID
  getMuscleNameById(id: number | any): string {
    // If id is already a Muscle object
    if (typeof id === "object" && id !== null && "name" in id) {
      return id.name;
    }

    // Otherwise look it up by ID
    const muscle = this.muscles.find((m) => m.id === id);
    return muscle ? muscle.name : "Unknown";
  }

  // Get equipment name by ID
  getEquipmentNameById(id: number | any): string {
    // If id is already an Equipment object
    if (typeof id === "object" && id !== null && "name" in id) {
      return id.name;
    }

    // Otherwise look it up by ID
    const item = this.equipment.find((e) => e.id === id);
    return item ? item.name : "Unknown";
  }

  // Get primary muscles as string
  getPrimaryMuscles(exercise: Exercise): string {
    if (!exercise.muscles || !this.muscles.length) {
      return "Various muscles";
    }

    return exercise.muscles.map((id) => this.getMuscleNameById(id)).join(", ");
  }

  // Get equipment as string
  getEquipment(exercise: Exercise): string {
    if (!exercise.equipment || !this.equipment.length) {
      return "No equipment";
    }

    return exercise.equipment
      .map((id) => this.getEquipmentNameById(id))
      .join(", ");
  }

  // Get a shortened description for cards
  getShortDescription(description: string): string {
    if (!description) return '';
    
    // Remove HTML tags and get plain text
    const plainText = description.replace(/<[^>]*>?/gm, '');
    
    // Truncate to a reasonable length
    return plainText.length > 120 
      ? plainText.substring(0, 120) + '...'
      : plainText;
  }

  // Search exercises by name
  searchExercises() {
    if (this.searchTerm.trim() === '') {
      this.loadData(); // Reload all data if search term is empty
      return;
    }
    
    this.loading = true;
    
    // Search by filtering local data
    this.wgerService.getExercises(50).subscribe({
      next: (exercises) => {
        // Filter exercises locally based on search term
        const filteredExercises = exercises.filter((ex: any) => 
          ex.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (ex.description && ex.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
        );
        
        this.exercises = filteredExercises;
        this.loading = false;
      },
      error: (error) => {
        this.handleApiError(error, null as any);
      }
    });
  }

  // Refresh the data
  doRefresh(event: any) {
    this.loadData().then(() => {
      event.target.complete();
    });
  }

  // Get language name for display
  getLanguageName(languageCode: string): string {
    const languages: Record<string, string> = {
      'pt': 'Português',
      'pt-pt': 'Português (Portugal)',
      'pt-br': 'Português (Brasil)',
      'en': 'English',
      'es': 'Español',
      'de': 'Deutsch'
    };
    
    return languages[languageCode as keyof typeof languages] || languageCode;
  }

  // Handle image loading errors
  handleImageError(event: any, exercise: any) {
    const img = event.target;
    
    // First try to use a muscle image if available
    if (exercise.muscles && exercise.muscles.length > 0) {
      const muscleId = typeof exercise.muscles[0] === 'object' 
        ? exercise.muscles[0].id 
        : exercise.muscles[0];
      
      const muscle = this.muscles.find(m => m.id === muscleId);
      
      if (muscle && (muscle.image_url_main || muscle.image_url_secondary)) {
        img.src = muscle.image_url_main || muscle.image_url_secondary;
        if (exercise.images && exercise.images.length) {
          exercise.images[0].is_fallback = true;
        }
        return;
      }
    }
    
    // Fall back to generic image
    img.src = 'assets/images/generic-exercise.png';
    if (exercise.images && exercise.images.length) {
      exercise.images[0].is_fallback = true;
    }
  }
}
