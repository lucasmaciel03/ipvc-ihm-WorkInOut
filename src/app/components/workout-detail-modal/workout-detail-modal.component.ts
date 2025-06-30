import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CustomAlertService } from '../../shared/services/alert.service';
import { WorkoutProgressService, WorkoutSession } from '../../core/services/workout-progress.service';

// Interface para o progresso de um exercício
interface ExerciseProgress {
  nome: string;
  completed?: boolean;
  startTime?: Date;
  endTime?: Date;
  sets?: any[];
}

interface Equipment {
  image: string;
  name: string;
}

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
  activeWorkout: WorkoutSession | null = null;

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
  completedItemName: string = '';

  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private workoutProgressService: WorkoutProgressService,
    private alertController: AlertController,
    private customAlertService: CustomAlertService
  ) {}

  ngOnInit() {
    if (this.program?.exercicios?.length > 0) {
      this.currentExercise = this.program.exercicios[0];
      this.validateProgramData();
      
      // Verificar se já existe um treino em andamento
      if (this.workoutProgressService.hasActiveWorkout()) {
        this.activeWorkout = this.workoutProgressService.getCurrentWorkout();
        
        // Se o treino em andamento for do mesmo programa, restaurar o estado
        if (this.activeWorkout && this.activeWorkout.programId === this.program.nome_programa) {
          this.restoreWorkoutState();
        } else {
          // Se for de outro programa, perguntar se deseja cancelar o treino anterior
          this.confirmCancelPreviousWorkout();
        }
      }
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

  async startWorkout() {
    // Se não houver treino ativo ou for um treino diferente, iniciar novo
    if (!this.activeWorkout || this.activeWorkout.programId !== this.program.nome_programa) {
      try {
        this.activeWorkout = this.workoutProgressService.startWorkout(this.program);
      } catch (error) {
        console.error('Erro ao iniciar treino:', error);
        return;
      }
    }
    
    // Marcar exercício atual como iniciado
    if (this.currentExercise) {
      try {
        this.workoutProgressService.startExercise(this.currentExercise.nome);
      } catch (error) {
        console.error('Erro ao iniciar exercício:', error);
      }
    }
    
    this.showTimer = true;
  }

  finishWorkout() {
    this.showTimer = false;
    
    // Marcar exercício atual como concluído
    if (this.currentExercise && this.activeWorkout) {
      try {
        this.workoutProgressService.completeExercise(this.currentExercise.nome);
      } catch (error) {
        console.error('Erro ao concluir exercício:', error);
      }
    }
    
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
    
    // Verificar se todos os exercícios foram concluídos
    const allExercisesCompleted = this.activeWorkout && 
                                 this.activeWorkout.completedExercises === this.activeWorkout.totalExercises;
    
    // Se todos os exercícios foram concluídos, mostrar o nome do programa, caso contrário, mostrar o nome do exercício atual
    this.completedItemName = allExercisesCompleted ? 
                           (this.program?.nome_programa || '') : 
                           (this.currentExercise?.nome || '');
    
    this.showComplete = true;
  }

  onWorkoutContinue() {
    this.showComplete = false;
    this.showTimer = false;
  }

  async onWorkoutFinish() {
    this.showComplete = false;
    
    if (!this.activeWorkout) {
      this.showSummary = true;
      return;
    }
    
    // Verificar manualmente se todos os exercícios foram concluídos
    // Contar exercícios concluídos diretamente para garantir precisão
    const completedExercises = this.activeWorkout.exercisesProgress.filter(ex => ex.completed).length;
    const totalExercises = this.activeWorkout.exercisesProgress.length;
    
    console.log(`Exercícios concluídos: ${completedExercises}/${totalExercises}`);
    
    // Verificar se há realmente exercícios pendentes
    if (completedExercises < totalExercises) {
      // Mostrar confirmação com alerta personalizado se nem todos os exercícios foram concluídos
      const exercisesRemaining = totalExercises - completedExercises;
      
      console.log('Exercícios restantes:', exercisesRemaining);
      
      // Criar um modal personalizado usando o customAlertService que suporta HTML
      this.customAlertService.dismiss(); // Limpar qualquer alerta existente
      
      // Mostrar o alerta personalizado que suporta HTML
      this.customAlertService.show({
        header: '⚠️ Terminar Treino?',
        subHeader: `Ainda tens ${exercisesRemaining} exercício${exercisesRemaining > 1 ? 's' : ''} por completar`,
        message: 'Tens a certeza que queres sair? O teu progresso não será guardado.',
        icon: 'warning-outline',
        iconColor: '#FF9800',
        cssClass: 'workout-warning',
        buttons: [
          {
            text: 'Continuar Treino',
            role: 'cancel',
            cssClass: 'motivational-btn',
            handler: () => {
              console.log('Continuando treino');
              // Não faz nada, apenas fecha o alerta
            }
          },
          {
            text: 'Sair Mesmo Assim',
            cssClass: 'destructive-btn',
            handler: () => {
              console.log('Finalizando treino com exercícios pendentes');
              this.finalizeWorkout(true);
            }
          }
        ]
      });
    } else {
      // Se todos os exercícios foram concluídos, finalizar normalmente
      console.log('Todos os exercícios foram concluídos, finalizando normalmente');
      this.finalizeWorkout(false);
    }
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  getEquipments(): Equipment[] {
    if (!this.currentExercise?.equipamentos || !this.currentExercise?.imagem_equipamentos) {
      return [];
    }

    return this.currentExercise.equipamentos.map((name, index) => {
      return {
        name,
        image: this.currentExercise?.imagem_equipamentos?.[index] || 'assets/icons/equipment-default.png'
      };
    });
  }
  
  /**
   * Valida e completa os dados do programa de treino
   */
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
  
  /**
   * Verifica se um exercício está concluído com base no seu nome
   * @param exerciseName Nome do exercício a verificar
   * @returns true se o exercício estiver concluído, false caso contrário
   */
  isExerciseCompleted(exerciseName: string | undefined): boolean {
    // Verificar se há um treino ativo e não concluído
    if (!exerciseName || !this.activeWorkout || !this.activeWorkout.exercisesProgress || this.activeWorkout.completed) {
      return false;
    }
    
    // Verificar se o exercício está concluído na sessão atual
    const exerciseProgress = this.activeWorkout.exercisesProgress.find((ex: ExerciseProgress) => ex.nome === exerciseName);
    return exerciseProgress?.completed || false;
  }
  
  /**
   * Verifica se um exercício está em andamento (iniciado mas não concluído)
   * @param exerciseName Nome do exercício a verificar
   * @returns true se o exercício estiver em andamento, false caso contrário
   */
  isExerciseInProgress(exerciseName: string | undefined): boolean {
    // Verificar se há um treino ativo e não concluído
    if (!exerciseName || !this.activeWorkout || !this.activeWorkout.exercisesProgress || this.activeWorkout.completed) {
      return false;
    }
    
    // Verificar se o exercício está em progresso na sessão atual
    const exerciseProgress = this.activeWorkout.exercisesProgress.find((ex: ExerciseProgress) => ex.nome === exerciseName);
    return exerciseProgress?.startTime != null && !exerciseProgress?.completed;
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
      // Se o exercício atual estiver em andamento, perguntar se deseja marcá-lo como concluído
      if (this.activeWorkout && this.currentExercise) {
        const exerciseProgress = this.activeWorkout.exercisesProgress.find(
          ex => ex.nome === this.currentExercise?.nome
        );
        
        if (exerciseProgress && exerciseProgress.startTime && !exerciseProgress.completed) {
          this.confirmCompleteExercise();
          return;
        }
      }
      
      this.currentExerciseIndex++;
      this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
      this.resetState();
    }
  }

  /**
   * Navega para o exercício anterior
   */
  previousExercise() {
    if (this.hasPreviousExercise) {
      // Se o exercício atual estiver em andamento, perguntar se deseja marcá-lo como concluído
      if (this.activeWorkout && this.currentExercise) {
        const exerciseProgress = this.activeWorkout.exercisesProgress.find(
          ex => ex.nome === this.currentExercise?.nome
        );
        
        if (exerciseProgress && exerciseProgress.startTime && !exerciseProgress.completed) {
          this.confirmCompleteExercise();
          return;
        }
      }
      
      this.currentExerciseIndex--;
      this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
      this.resetState();
    }
  }
  
  /**
   * Navega diretamente para um exercício específico pelo seu índice
   * @param index Índice do exercício na lista de exercícios
   */
  goToExercise(index: number) {
    if (index >= 0 && index < this.program.exercicios.length) {
      // Se o exercício atual estiver em andamento, perguntar se deseja marcá-lo como concluído
      if (this.activeWorkout && this.currentExercise) {
        const exerciseProgress = this.activeWorkout.exercisesProgress.find(
          ex => ex.nome === this.currentExercise?.nome
        );
        
        if (exerciseProgress && exerciseProgress.startTime && !exerciseProgress.completed) {
          // Salvamos o índice para onde queremos ir após confirmar a conclusão
          this.confirmCompleteExercise();
          return;
        }
      }
      
      this.currentExerciseIndex = index;
      this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
      this.resetState();
    }
  }
  
  /**
   * Reinicia o estado da interface para o exercício atual
   */
  private resetState() {
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

  async dismiss() {
    // Se houver um treino em andamento, perguntar se deseja cancelá-lo
    if (this.activeWorkout && !this.activeWorkout.completed) {
      const alert = await this.alertController.create({
        header: 'Sair do treino?',
        message: 'O teu treino está em andamento. Queres sair sem guardar o progresso?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Sair',
            handler: () => {
              // Não cancelar o treino, apenas fechar o modal
              this.modalCtrl.dismiss();
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      this.modalCtrl.dismiss();
    }
  }
  
  /**
   * Finaliza o treino atual
   * @param forceFinish Se verdadeiro, força a finalização mesmo com exercícios incompletos
   */
  private finalizeWorkout(forceFinish: boolean) {
    try {
      console.log('Finalizando treino, forçar finalização:', forceFinish);
      
      // Verificar se o treino está realmente completo antes de finalizar
      if (!forceFinish) {
        const completedExercises = this.activeWorkout?.exercisesProgress.filter(ex => ex.completed).length || 0;
        const totalExercises = this.activeWorkout?.exercisesProgress.length || 0;
        
        console.log(`Verificação final: ${completedExercises}/${totalExercises} exercícios concluídos`);
        
        // Se não estiver completo e não estiver a forçar, mostrar alerta
        if (completedExercises < totalExercises) {
          console.log('Treino incompleto, mas forceFinish é false. Ajustando para true.');
          forceFinish = true;
        }
      }
      
      // Finalizar o treino
      const finishedWorkout = this.workoutProgressService.finishWorkout(forceFinish);
      this.activeWorkout = finishedWorkout;
      this.showSummary = true;
      
      // Fechar o modal após um breve atraso para mostrar o sumário
      setTimeout(() => {
        this.modalCtrl.dismiss({
          completed: true,
          workout: finishedWorkout
        });
      }, 500);
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
    }
  }

  /**
   * Restaura o estado do treino em andamento
   */
  private restoreWorkoutState() {
    if (!this.activeWorkout) return;
    
    // Encontrar o índice do último exercício iniciado ou o primeiro não concluído
    const lastStartedIndex = this.activeWorkout.exercisesProgress.findIndex(
      (ex: ExerciseProgress) => ex.startTime && !ex.completed
    );
    
    if (lastStartedIndex >= 0) {
      this.currentExerciseIndex = lastStartedIndex;
    } else {
      // Se todos estiverem concluídos ou nenhum iniciado, encontrar o primeiro não concluído
      const firstIncompleteIndex = this.activeWorkout.exercisesProgress.findIndex(
        (ex: ExerciseProgress) => !ex.completed
      );
      
      if (firstIncompleteIndex >= 0) {
        this.currentExerciseIndex = firstIncompleteIndex;
      }
    }
    
    // Atualizar exercício atual
    if (this.program?.exercicios && this.program.exercicios.length > this.currentExerciseIndex) {
      this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
    }
  }

  /**
   * Confirma se o utilizador deseja cancelar um treino anterior em andamento
   */
  private async confirmCancelPreviousWorkout() {
    const alert = await this.alertController.create({
      header: 'Treino em andamento',
      message: 'Já tens um treino diferente em andamento. Queres cancelá-lo e iniciar este novo treino?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            this.closeModal();
          }
        },
        {
          text: 'Sim',
          handler: () => {
            this.workoutProgressService.cancelWorkout();
            this.activeWorkout = null;
          }
        }
      ]
    });
    
    await alert.present();
  }

  /**
   * Confirma se o utilizador deseja marcar o exercício atual como concluído
   */
  private async confirmCompleteExercise() {
    const alert = await this.alertController.create({
      header: 'Exercício em andamento',
      message: 'Queres marcar este exercício como concluído antes de avançar?',
      buttons: [
        {
          text: 'Não',
          handler: () => {
            this.currentExerciseIndex++;
            this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
            this.resetState();
          }
        },
        {
          text: 'Sim',
          handler: () => {
            if (this.currentExercise) {
              this.workoutProgressService.completeExercise(this.currentExercise.nome);
              this.currentExerciseIndex++;
              this.currentExercise = this.program.exercicios[this.currentExerciseIndex];
              this.resetState();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
}
