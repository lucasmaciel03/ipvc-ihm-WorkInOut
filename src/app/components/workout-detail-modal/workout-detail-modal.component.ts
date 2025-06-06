import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Exercise {
  nome: string;
  video?: string;
  tempo_medio?: string;
  equipamentos?: string[];
  imagem_equipamentos?: string[];
  dificuldade?: string;
  avaliacao?: string;
  musculos_trabalhados?: string[];
}
import { WorkoutTimerComponent } from '../workout-timer/workout-timer.component';
import { WorkoutSetInputComponent, WorkoutSet } from '../workout-set-input/workout-set-input.component';
import { WorkoutCompleteComponent } from '../workout-complete/workout-complete.component';
import { WorkoutSummaryComponent } from '../workout-summary/workout-summary.component';

@Component({
  selector: 'app-workout-detail-modal',
  templateUrl: './workout-detail-modal.component.html',
  styleUrls: ['./workout-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, WorkoutTimerComponent, WorkoutSetInputComponent, WorkoutCompleteComponent, WorkoutSummaryComponent]
})
export class WorkoutDetailModalComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer: any;
  @ViewChild(WorkoutTimerComponent) timer: WorkoutTimerComponent | undefined;
  @ViewChild(WorkoutSetInputComponent) setInput: WorkoutSetInputComponent | undefined;

  program: any;
  currentExerciseIndex = 0;
  currentExercise: Exercise | null = null;

  private difficultyMap: { [key: string]: number } = {
    'Iniciante': 1,
    'Intermédio': 2,
    'Avançado': 3
  };

  get hasNextExercise(): boolean {
    return this.program?.exercicios && this.currentExerciseIndex < this.program.exercicios.length - 1;
  }

  get hasPreviousExercise(): boolean {
    return this.program?.exercicios && this.currentExerciseIndex > 0;
  }

  isPlaying = false;
  showTimer = false;
  showComplete = false;
  showSummary = false;
  workoutSets: WorkoutSet[] = [];

  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (this.program?.exercicios?.length > 0) {
      this.currentExercise = this.program.exercicios[0];
      this.validateProgramData();
    }
  }

  toggleVideo(videoElement: HTMLVideoElement) {
    if (videoElement.paused) {
      videoElement.play();
      this.isPlaying = true;
    } else {
      videoElement.pause();
      this.isPlaying = false;
    }
  }

  startWorkout() {
    this.showTimer = true;
  }

  finishWorkout() {
    this.showTimer = false;
    if (this.setInput) {
      this.setInput.show();
    }
  }

  onTimerComplete() {
    if (this.setInput) {
      this.setInput.show();
    }
  }

  onSetCompleted(set: WorkoutSet) {
    this.workoutSets.push(set);
    this.showComplete = true;
  }

  onWorkoutContinue() {
    this.showComplete = false;
    this.showTimer = false;
  }

  onWorkoutFinish() {
    this.showComplete = false;
    this.showSummary = true;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  private validateProgramData() {
    if (!this.program.descricao) this.program.descricao = 'Descrição não disponível';
    if (!this.program.total_exercicios) this.program.total_exercicios = this.program.exercicios?.length || 0;
    if (!this.program.calorias_estimadas) this.program.calorias_estimadas = 0;
    if (!this.program.tags) this.program.tags = [];
    if (!this.program.pre_requisitos) {
      this.program.pre_requisitos = {
        nivel_minimo: 'Iniciante',
        equipamentos_necessarios: [],
        conhecimento_previo: []
      };
    }

    // Validar exercícios
    this.program.exercicios?.forEach((exercicio: Exercise) => {
      if (!exercicio.avaliacao) exercicio.avaliacao = '0.0';
      if (!exercicio.dificuldade) exercicio.dificuldade = 'Iniciante';
      if (!exercicio.musculos_trabalhados) exercicio.musculos_trabalhados = [];
      if (!exercicio.equipamentos) exercicio.equipamentos = [];
      if (!exercicio.imagem_equipamentos) exercicio.imagem_equipamentos = [];
      if (!exercicio.tempo_medio) exercicio.tempo_medio = 'Não especificado';
    });
  }

  getYouTubeEmbedUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    const videoId = this.getYouTubeVideoId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private getYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  getDifficultyFlames(difficulty: string | undefined): number[] {
    if (!difficulty) return [];
    const flameCount = this.difficultyMap[difficulty] || 0;
    return Array(flameCount).fill(0);
  }

  getRemainingFlames(difficulty: string | undefined): number[] {
    if (!difficulty) return Array(3).fill(0);
    const flameCount = this.difficultyMap[difficulty] || 0;
    const remainingCount = 3 - flameCount;
    return Array(remainingCount).fill(0);
  }

  nextExercise() {
    if (this.hasNextExercise) {
      this.currentExerciseIndex++;
      this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
      this.resetState();
    }
  }

  previousExercise() {
    if (this.hasPreviousExercise) {
      this.currentExerciseIndex--;
      this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
      this.resetState();
    }
  }

  private resetState() {
    this.isPlaying = false;
    this.showTimer = false;
    this.showComplete = false;
    this.showSummary = false;
    this.workoutSets = [];
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.pause();
      this.videoPlayer.nativeElement.currentTime = 0;
    }
  }

  onSetDismissed() {
    console.log('Set input dismissed');
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
