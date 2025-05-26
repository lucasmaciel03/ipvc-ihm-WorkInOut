import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { WgerService } from "../services/wger.service";
import { Exercise } from "../models/exercise.model";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { SafePipe } from "../pipes/safe.pipe";

@Component({
  selector: "app-exercise-details",
  templateUrl: "./exercise-details.page.html",
  styleUrls: ["./exercise-details.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    HttpClientModule,
    SafePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Keep this for custom elements
})
export class ExerciseDetailsPage implements OnInit {
  exerciseId: number = 0;
  exercise: any = null;
  loading: boolean = true;
  error: string | null = null;
  currentImageIndex: number = 0; // For manual image navigation
  currentVideoIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private wgerService: WgerService,
    private loadingController: LoadingController
  ) {
    // Set language to Portuguese on component initialization
    this.wgerService.setLanguage("pt-PT");
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.exerciseId = +id;
      await this.loadExerciseDetails();
    }
  }

  async loadExerciseDetails() {
    const loading = await this.loadingController.create({
      message: "Loading exercise details...",
      spinner: "crescent",
    });
    await loading.present();

    this.loading = true;
    this.error = null;

    this.wgerService.getExerciseDetails(this.exerciseId).subscribe({
      next: (data: any) => {
        this.exercise = data;
        console.log("Exercise details:", this.exercise);
        this.loading = false;
        loading.dismiss();
      },
      error: (error: any) => {
        console.error("Error loading exercise details:", error);
        this.error = error.message || "Failed to load exercise details";
        this.loading = false;
        loading.dismiss();
      },
    });
  }

  // Simple image navigation without Swiper
  nextImage() {
    if (this.exercise?.images && this.exercise.images.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.exercise.images.length;
    }
  }

  prevImage() {
    if (this.exercise?.images && this.exercise.images.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.exercise.images.length) %
        this.exercise.images.length;
    }
  }

  // Handle image loading errors
  handleImageError(event: any, exercise: any) {
    const img = event.target;
    img.src = "assets/images/generic-exercise.png";

    // Mark this as a fallback image
    if (exercise.images[this.currentImageIndex]) {
      exercise.images[this.currentImageIndex].is_fallback = true;
    }
  }

  // Check if a muscle is on the front of the body
  isFrontMuscle(muscle: any): boolean {
    if (!muscle) return true;

    // If it's an object with is_front property
    if (typeof muscle === "object" && "is_front" in muscle) {
      return muscle.is_front;
    }

    // Otherwise find the muscle in our muscles list from the API data
    const muscleId = typeof muscle === "object" ? muscle.id : muscle;
    const muscleRef = this.findMuscleById(muscleId);
    return muscleRef ? muscleRef.is_front : true;
  }

  // Find muscle by ID in our API data
  findMuscleById(id: number): any {
    if (!this.exercise) return null;

    // Check both primary and secondary muscles
    if (this.exercise.muscles) {
      for (let muscle of this.exercise.muscles) {
        const muscleId = typeof muscle === "object" ? muscle.id : muscle;
        if (muscleId === id) return muscle;
      }
    }

    if (this.exercise.muscles_secondary) {
      for (let muscle of this.exercise.muscles_secondary) {
        const muscleId = typeof muscle === "object" ? muscle.id : muscle;
        if (muscleId === id) return muscle;
      }
    }

    return null;
  }

  // Get position for a muscle on the body diagram
  getMusclePosition(muscle: any): {
    top: string;
    left: string;
    width: string;
    height: string;
  } {
    // Define positions for different muscles
    const musclePositions: any = {
      // Common muscle positions - adjust these based on your muscle images
      1: { top: "20%", left: "50%", width: "30%", height: "10%" }, // Biceps
      2: { top: "40%", left: "50%", width: "30%", height: "15%" }, // Triceps
      4: { top: "30%", left: "50%", width: "40%", height: "20%" }, // Chest
      6: { top: "45%", left: "50%", width: "30%", height: "15%" }, // Abs
      8: { top: "60%", left: "50%", width: "40%", height: "15%" }, // Quads
      // Add more as needed
    };

    // Get the muscle ID
    const muscleId = typeof muscle === "object" ? muscle.id : muscle;

    // Return the position or a default if not found
    return (
      musclePositions[muscleId] || {
        top: "0%",
        left: "0%",
        width: "0%",
        height: "0%",
      }
    );
  }

  // Update current video when segment changes
  updateCurrentVideo() {
    console.log("Changed to video index:", this.currentVideoIndex);
  }

  // Determine video source (YouTube, Vimeo, or direct file)
  getVideoSource(video: any): string {
    if (this.isYoutubeVideo(video)) {
      return "YouTube";
    } else if (this.isVimeoVideo(video)) {
      return "Vimeo";
    } else {
      return "Video";
    }
  }

  // Check if video is from YouTube
  isYoutubeVideo(video: any): boolean {
    return (
      video.video &&
      (video.video.includes("youtube.com") || video.video.includes("youtu.be"))
    );
  }

  // Check if video is from Vimeo
  isVimeoVideo(video: any): boolean {
    return video.video && video.video.includes("vimeo.com");
  }

  // Check if video is a direct video file
  isDirectVideo(video: any): boolean {
    return (
      video.video && !this.isYoutubeVideo(video) && !this.isVimeoVideo(video)
    );
  }

  // Get YouTube embed URL
  getYoutubeEmbedUrl(video: any): string {
    let videoId = "";

    if (video.video.includes("youtube.com/watch")) {
      videoId = new URL(video.video).searchParams.get("v") || "";
    } else if (video.video.includes("youtu.be/")) {
      videoId = video.video.split("youtu.be/")[1];
    }

    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Get Vimeo embed URL
  getVimeoEmbedUrl(video: any): string {
    const videoId = video.video.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  // Get video title
  getVideoTitle(video: any): string {
    return video.title || this.exercise.name;
  }
}
