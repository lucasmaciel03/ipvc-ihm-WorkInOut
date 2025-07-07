import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CustomAlertService } from '../../shared/services/alert.service';
import { WorkoutProgressService, WorkoutSession } from '../../core/services/workout-progress.service';
import { WorkoutService } from '../../services/workout.service';

@Pipe({
  name: 'formatTime',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number): string {
    if (!value) return '00:00';
    
    const minutes: number = Math.floor(value / 60);
    const seconds: number = Math.floor(value % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

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
  imports: [CommonModule, IonicModule, WorkoutTimerComponent, WorkoutSetInputComponent, WorkoutCompleteComponent, WorkoutSummaryComponent, FormatTimePipe]
})
export class WorkoutDetailModalComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer: any;
  @ViewChild(WorkoutTimerComponent) timer: WorkoutTimerComponent | undefined;
  @ViewChild(WorkoutSetInputComponent) setInput: WorkoutSetInputComponent | undefined;

  program: any;
  currentExerciseIndex = 0;
  currentExercise: Exercise | null = null;
  activeWorkout: WorkoutSession | null = null;
  resumingWorkout = false;

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
  isProgramSaved = false;
  workoutSets: WorkoutSet[] = [];
  completedItemName: string = '';
  
  // Variáveis para controlo do vídeo
  videoProgress: number = 0;
  currentTime: number = 0;
  duration: number = 0;
  isLoading: boolean = true;
  
  // Cache para URLs de vídeo já processados
  private _cachedVideoUrls: {[key: string]: SafeResourceUrl} = {};

  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private workoutProgressService: WorkoutProgressService,
    private alertController: AlertController,
    private customAlertService: CustomAlertService,
    private toastCtrl: ToastController,
    private workoutService: WorkoutService
  ) {}

  ngOnInit() {
    // Inicializar o estado do componente
    this.resetState();
    
    if (this.program?.exercicios?.length > 0) {
      this.currentExercise = this.program.exercicios[0];
      this.validateProgramData();
      
      // Verificar se o programa está salvo
      this.isProgramSaved = this.workoutService.isProgramSaved(this.program);
      
      // Verificar se estamos retomando um treino pendente
      if (this.resumingWorkout && this.workoutProgressService.hasPendingWorkout()) {
        this.activeWorkout = this.workoutProgressService.getCurrentWorkout();
        // Restaurar o estado do treino pendente
        if (this.activeWorkout && this.activeWorkout.programId === this.program.nome_programa) {
          this.restoreWorkoutState();
          this.showToast('Treino retomado com sucesso!');
        }
      }
      // Verificar se já existe um treino em andamento (não pendente)
      else if (this.workoutProgressService.hasActiveWorkout()) {
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

  /**
   * Alterna entre reproduzir e pausar o vídeo
   * @param videoElement Elemento de vídeo HTML
   */
  toggleVideo(videoElement: HTMLVideoElement) {
    if (!videoElement) return;
    
    if (videoElement.paused) {
      videoElement.play()
        .then(() => {
          this.isPlaying = true;
          this.duration = videoElement.duration;
          console.log('Vídeo iniciado com sucesso');
        })
        .catch(err => {
          console.error('Erro ao reproduzir vídeo:', err);
          this.showToast('Não foi possível reproduzir o vídeo', 'danger');
          this.isPlaying = false;
        });
    } else {
      videoElement.pause();
      this.isPlaying = false;
      console.log('Vídeo pausado');
    }
  }
  
  /**
   * Atualiza o progresso do vídeo
   * @param event Evento de atualização de tempo
   */
  updateProgress(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video) {
      this.currentTime = video.currentTime;
      this.duration = video.duration || 0;
      this.videoProgress = (this.currentTime / this.duration) * 100 || 0;
    }
  }
  
  /**
   * Alterna entre modo normal e tela cheia
   * @param videoElement Elemento de vídeo HTML
   */
  toggleFullscreen(videoElement: HTMLVideoElement) {
    if (!document.fullscreenElement) {
      videoElement.requestFullscreen().catch(err => {
        console.error('Erro ao entrar em tela cheia:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }
  
  /**
   * Manipula o evento de fim do vídeo
   */
  onVideoEnded() {
    this.isPlaying = false;
    this.videoProgress = 100;
    // O vídeo terminou, mas não mostramos nenhuma mensagem
  }
  
  /**
   * Permite ao utilizador navegar para um ponto específico do vídeo clicando na barra de progresso
   * @param event Evento de clique
   * @param videoElement Elemento de vídeo HTML
   */
  seekVideo(event: MouseEvent, videoElement: HTMLVideoElement) {
    if (!videoElement || !videoElement.duration) return;
    
    const progressContainer = event.currentTarget as HTMLElement;
    const rect = progressContainer.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    
    // Calcular o novo tempo com base na posição do clique
    const newTime = videoElement.duration * clickPosition;
    
    // Definir o novo tempo do vídeo
    videoElement.currentTime = newTime;
    
    // Atualizar as variáveis de controlo
    this.currentTime = newTime;
    this.videoProgress = (newTime / videoElement.duration) * 100;
  }
  
  /**
   * Lida com erros de carregamento do vídeo
   * @param event Evento de erro
   */
  handleVideoError(event: Event) {
    this.isLoading = false;
    this.isPlaying = false;
    
    const video = event.target as HTMLVideoElement;
    const error = video?.error;
    
    console.error('Erro ao carregar vídeo:', {
      event,
      error,
      src: video?.src,
      currentExercise: this.currentExercise
    });
    
    // Verificar se o vídeo é do YouTube e tentar carregar como fallback
    if (this.currentExercise?.video?.includes('youtube')) {
      this.showToast('Vídeos do YouTube não são suportados diretamente. A usar imagem de apoio.', 'warning');
    } else {
      this.showToast('Não foi possível carregar o vídeo. A usar imagem de apoio.', 'warning');
    }
  }
  
  /**
   * Manipula o evento de carregamento dos metadados do vídeo
   * @param event Evento de carregamento de metadados
   */
  handleMetadataLoaded(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video) {
      this.duration = video.duration || 0;
      this.isLoading = false;
      
      console.log('Metadados do vídeo carregados:', {
        duration: this.duration,
        src: video.src,
        readyState: video.readyState
      });
      
      // Reduzir o tempo de carregamento definindo a qualidade inicial mais baixa
      if (video.readyState >= 1) {
        // Definir o tempo de início para 0 para pré-carregar o início do vídeo
        video.currentTime = 0;
        
        // Otimizar o carregamento do vídeo
        this.optimizeVideoPlayback(video);
      }
    }
  }
  
  /**
   * Retorna o URL do poster para o vídeo atual
   * @returns URL da imagem para usar como poster do vídeo
   */
  getVideoPoster(): string {
    console.log('getVideoPoster - Program:', this.program);
    console.log('getVideoPoster - CurrentExercise:', this.currentExercise);
    
    if (!this.currentExercise || !this.program) {
      console.log('getVideoPoster - Sem exercício ou programa');
      return '';
    }
    
    // Usar a imagem do programa como poster principal
    if (this.program.imagem_programa) {
      console.log('getVideoPoster - Usando imagem do programa:', this.program.imagem_programa);
      return this.program.imagem_programa;
    }
    
    // Fallback para uma imagem baseada na categoria do programa
    const categorias = {
      'ficar em forma': '/assets/images/programas/funcional_programa.png',
      'perder peso': '/assets/images/programas/hiit_total.png',
      'ganhar massa': '/assets/images/programas/peito_explosivo.png',
      'tonificar': '/assets/images/programas/core_ferro.png'
    };
    
    // Verificar se o nome do programa contém alguma das categorias conhecidas
    if (this.program.nome_programa) {
      const nomeLowerCase = this.program.nome_programa.toLowerCase();
      console.log('getVideoPoster - Nome do programa:', nomeLowerCase);
      
      for (const [categoria, imagem] of Object.entries(categorias)) {
        if (nomeLowerCase.includes(categoria)) {
          console.log('getVideoPoster - Categoria encontrada:', categoria, 'Imagem:', imagem);
          return imagem;
        }
      }
    }
    
    // Usar uma imagem existente como fallback em vez de workout_placeholder.png
    console.log('getVideoPoster - Usando imagem padrão');
    return '/assets/images/programas/funcional_programa.png';
  }
  
  /**
   * Otimiza a reprodução do vídeo para melhorar o desempenho
   * @param videoElement Elemento de vídeo HTML
   */
  private optimizeVideoPlayback(videoElement: HTMLVideoElement) {
    // Definir atributos para otimizar o carregamento
    videoElement.muted = true; // Permite autoplay em mais navegadores
    
    // Usar playbackRate mais baixo inicialmente para permitir buffering mais rápido
    videoElement.playbackRate = 0.5;
    
    // Pré-carregar o início do vídeo para exibição imediata
    setTimeout(() => {
      // Restaurar a taxa de reprodução normal após o carregamento inicial
      videoElement.playbackRate = 1.0;
      videoElement.muted = false;
      
      // Tentar carregar mais do vídeo em segundo plano
      try {
        // Verificar se a API NetworkInformation está disponível
        const connection = (navigator as any).connection;
        
        if (connection && connection.effectiveType && connection.effectiveType !== 'slow-2g') {
          // Se a conexão for razoável, pré-carregar mais do vídeo
          videoElement.preload = 'auto';
        } else {
          // Para conexões mais lentas, manter apenas os metadados
          videoElement.preload = 'metadata';
        }
      } catch (e) {
        // Fallback se a API não estiver disponível
        videoElement.preload = 'metadata';
      }
    }, 1000);
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
      const exercisesRemaining = totalExercises - completedExercises;
      
      console.log('Exercícios restantes:', exercisesRemaining);
      
      // Criar um modal personalizado usando o customAlertService que suporta HTML
      this.customAlertService.dismiss(); // Limpar qualquer alerta existente
      
      // Mostrar o alerta personalizado que suporta HTML
      this.customAlertService.show({
        header: '⚠️ Terminar Treino?',
        subHeader: `Ainda tens ${exercisesRemaining} exercício${exercisesRemaining > 1 ? 's' : ''} por completar`,
        message: 'O que desejas fazer com este treino?',
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
            text: 'Continuar Mais Tarde',
            cssClass: 'pending-btn',
            handler: () => {
              console.log('Marcando treino como pendente');
              this.markWorkoutAsPending();
            }
          },
          {
            text: 'Terminar mesmo assim',
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

  /**
   * Sanitiza o URL do vídeo para garantir que seja seguro para exibição
   * @param url Caminho do vídeo (local ou YouTube)
   * @returns SafeResourceUrl para o vídeo
   */
  sanitizeVideoUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    // Cache para evitar reprocessamento de URLs já sanitizados
    if (this._cachedVideoUrls && this._cachedVideoUrls[url]) {
      return this._cachedVideoUrls[url];
    }
    
    let safeUrl: SafeResourceUrl;
    
    // Se for um vídeo do YouTube, extrair o ID e gerar o URL de incorporação
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : '';
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      // Se for um vídeo local, sanitizar o caminho
      safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    
    // Guardar no cache
    if (!this._cachedVideoUrls) this._cachedVideoUrls = {};
    this._cachedVideoUrls[url] = safeUrl;
    
    return safeUrl;
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
      
      // Pré-carregar o próximo exercício se existir
      this.preloadNextExercise();
    }
  }
  
  /**
   * Pré-carrega o vídeo do próximo exercício para melhorar a experiência do utilizador
   */
  private preloadNextExercise() {
    if (this.hasNextExercise) {
      const nextExerciseIndex = this.currentExerciseIndex + 1;
      const nextExercise = this.program.exercicios[nextExerciseIndex];
      
      if (nextExercise?.video) {
        // Pré-processar o URL do vídeo para o cache
        this.sanitizeVideoUrl(nextExercise.video);
        
        // Criar um elemento de vídeo oculto para pré-carregar
        const preloadVideo = document.createElement('video');
        preloadVideo.style.display = 'none';
        preloadVideo.preload = 'metadata';
        preloadVideo.src = nextExercise.video;
        
        // Remover o elemento após carregar os metadados
        preloadVideo.onloadedmetadata = () => {
          if (preloadVideo.parentNode) {
            preloadVideo.parentNode.removeChild(preloadVideo);
          }
        };
        
        // Adicionar temporariamente ao DOM
        document.body.appendChild(preloadVideo);
      }
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
      
      // Mostrar indicador de carregamento antes de mudar de exercício
      this.isLoading = true;
      
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
   * Reinicia o estado do componente e otimiza o carregamento do vídeo
   */
  private resetState() {
    this.showTimer = false;
    this.showComplete = false;
    this.showSummary = false;
    this.workoutSets = [];
    this.videoProgress = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.isLoading = true;
    this.isPlaying = false; // Garantir que o vídeo não está marcado como reproduzindo
    
    // Otimizar o carregamento do vídeo atual
    setTimeout(() => {
      const videoElement = this.videoPlayer?.nativeElement;
      if (videoElement) {
        // Reiniciar o vídeo
        videoElement.pause();
        videoElement.currentTime = 0;
        
        // Definir atributos para otimizar o carregamento
        videoElement.muted = true; // Permite autoplay em mais navegadores
        videoElement.playbackRate = 1.0; // Taxa de reprodução normal
        videoElement.volume = 1.0; // Volume máximo quando desmutado
        
        // Pré-carregar apenas os metadados para acelerar o carregamento inicial
        videoElement.preload = 'metadata';
      }
    }, 100);
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
   * Mostra uma mensagem toast ao utilizador
   * @param message Mensagem a ser exibida
   * @param color Cor do toast (primary, success, warning, danger, etc)
   * @param duration Duração em milissegundos
   */
  async showToast(message: string, color: string = 'primary', duration: number = 2000) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'bottom',
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  /**
   * Alterna entre salvar e remover um programa dos favoritos
   */
  toggleSaveProgram() {
    if (this.isProgramSaved) {
      // Remover programa dos favoritos
      if (this.workoutService.removeProgram(this.program)) {
        this.isProgramSaved = false;
        this.showToast('Programa removido dos favoritos', 'medium');
      }
    } else {
      // Adicionar programa aos favoritos
      if (this.workoutService.saveProgram(this.program)) {
        this.isProgramSaved = true;
        this.showToast('Programa guardado nos favoritos', 'success');
      }
    }
  }

  
  /**
   * Marca o treino atual como pendente para continuar mais tarde
   */
  async markWorkoutAsPending() {
    try {
      // Marcar o treino como pendente usando o serviço
      const pendingWorkout = this.workoutProgressService.markWorkoutAsPending();
      console.log('Treino marcado como pendente:', pendingWorkout);
      
      // Mostrar toast de confirmação
      this.showToast('Treino guardado para continuar mais tarde', 'warning');
      
      // Fechar o modal
      this.closeModal();
    } catch (error) {
      console.error('Erro ao marcar treino como pendente:', error);
      // Mostrar mensagem de erro
      this.showToast('Erro ao guardar o treino', 'danger');
    }
  }

  /**
   * Finaliza o treino atual
   * @param force Se verdadeiro, força a finalização mesmo com exercícios incompletos
   */
  async finalizeWorkout(force: boolean = false) {
    try {
      console.log('Finalizando treino, forçar finalização:', force);
      
      // Verificar se há exercícios pendentes
      if (this.activeWorkout) {
        // Contar exercícios concluídos diretamente para garantir precisão
        const completedExercises = this.activeWorkout.exercisesProgress.filter(ex => ex.completed).length;
        const totalExercises = this.activeWorkout.exercisesProgress.length;
        
        // Verificar se todos os exercícios foram concluídos
        const allExercisesCompleted = completedExercises === totalExercises;
        
        if (!allExercisesCompleted && !force) {
          // Se nem todos os exercícios foram concluídos e não estamos forçando, perguntar ao utilizador
          const alert = await this.alertController.create({
            header: 'Treino incompleto',
            message: 'Ainda não concluíste todos os exercícios. Tens a certeza que queres finalizar o treino?',
            buttons: [
              {
                text: 'Não',
                role: 'cancel'
              },
              {
                text: 'Sim',
                handler: () => {
                  // Finalizar mesmo com exercícios incompletos
                  this.completeWorkout();
                }
              }
            ]
          });
          
          await alert.present();
          return;
        }
      }
      
      // Finalizar o treino
      const finishedWorkout = this.workoutProgressService.finishWorkout(force);
      this.activeWorkout = finishedWorkout;
      this.showSummary = true;
      
      // Não fechar automaticamente o modal para que o utilizador possa ver o sumário
      // O sumário terá um botão para fechar quando o utilizador desejar
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
      this.showToast('Erro ao finalizar o treino', 'danger');
    }
  }

  /**
   * Completa o treino atual e salva os dados
   */
  private completeWorkout() {
    // Marcar o treino como concluído
    // Implementar lógica de conclusão do treino quando o serviço estiver disponível
    // this.workoutProgressService.completeWorkout(this.program?.nome_programa || '');
    
    // Mostrar tela de conclusão
    this.showComplete = true;
    this.showTimer = false;
    
    // Mostrar toast de confirmação
    this.showToast('Treino concluído com sucesso!', 'success');
  }
  
  // Função closeModal já declarada anteriormente
  
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
   * Retorna o URL do vídeo atual para o elemento de vídeo
   * @param url URL do vídeo
   * @returns String URL para o elemento video
   */
  getVideoUrl(url: string | undefined): string {
    if (!url) return '';
    
    // Para vídeos locais, retornar o URL diretamente
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return url;
    }
    
    // Para vídeos do YouTube, usar um método diferente ou retornar vazio
    // já que o elemento <video> não suporta URLs do YouTube diretamente
    console.warn('URLs do YouTube não são suportados pelo elemento <video>');
    return '';
  }
  
  /**
   * Manipula o evento de início de carregamento do vídeo
   */
  onVideoLoadStart() {
    this.isLoading = true;
    this.isPlaying = false;
  }
  
  /**
   * Manipula o evento quando o vídeo pode começar a ser reproduzido
   */
  onVideoCanPlay() {
    this.isLoading = false;
  }
  
  /**
   * Manipula o evento quando o vídeo começa a ser reproduzido
   */
  onVideoPlay() {
    this.isPlaying = true;
  }
  
  /**
   * Manipula o evento quando o vídeo é pausado
   */
  onVideoPause() {
    this.isPlaying = false;
  }

  // ...existing code...
}
