import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ModalController, AlertController, ToastController, IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { register } from "swiper/element/bundle";
import { WorkoutService, WorkoutProgram } from "../../services/workout.service";
import { WorkoutDetailModalComponent } from "../../components/workout-detail-modal/workout-detail-modal.component";
import { WorkoutProgressService, WorkoutSession } from "../../core/services/workout-progress.service";
import { PendingWorkoutCardComponent } from "../../components/pending-workout-card/pending-workout-card.component";
import { ActiveWorkoutCardComponent } from '../../components/active-workout-card/active-workout-card.component';
import { AuthService, User } from "../../core/services/auth.service";

register();

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, PendingWorkoutCardComponent, ActiveWorkoutCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {
  selectedSegment = "all";
  muscleGroups: string[] = [];
  programs: WorkoutProgram[] = [];
  loading = true;
  @ViewChild("programSection") programSection: ElementRef | undefined;
  showSelectionGuide = false;

  searchTerm: string = "";
  filteredPrograms: WorkoutProgram[] = [];
  allPrograms: WorkoutProgram[] = []; // Armazenar todos os programas para pesquisa
  
  // Propriedades para gerenciar treinos pendentes
  hasPendingWorkout = false;
  pendingWorkout: WorkoutSession | null = null;
  hasActiveWorkout = false;
  activeWorkout: WorkoutSession | null = null;
  
  // Utilizador atual
  currentUser: User | null = null;

  constructor(
    private workoutService: WorkoutService,
    private modalCtrl: ModalController,
    private workoutProgressService: WorkoutProgressService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadMuscleGroups();
    this.loadPrograms("all"); // Começar mostrando todos os programas
    this.loadAllProgramsForSearch();
    this.checkPendingWorkout();
    this.checkActiveWorkout();
  }

  ionViewWillEnter() {
    this.loadCurrentUser();
    this.checkPendingWorkout();
    this.checkActiveWorkout();
  }
  
  /**
   * Carrega o utilizador atual do serviço de autenticação
   */
  loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  /**
   * Exibe um diálogo de confirmação antes de fazer logout
   */
  async showLogoutConfirmation() {
    const alert = await this.alertController.create({
      header: 'Terminar sessão',
      message: 'Tens a certeza que queres sair da tua conta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Sair',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }
  
  /**
   * Realiza o logout do utilizador e redireciona para a página de login
   */
  logout() {
    this.authService.logout();
    
    // Mostrar toast de confirmação
    this.showToast('Sessão terminada com sucesso', 'success');
    
    // Redirecionar para a página de login
    window.location.href = '/login';
  }

  private loadMuscleGroups() {
    this.workoutService.getAllMuscleGroups().subscribe((groups) => {
      this.muscleGroups = groups;
    });
  }

  onSegmentChange(event: any) {
    const muscleGroup = event.detail.value;
    this.loadPrograms(muscleGroup);
  }

  private loadPrograms(muscleGroup: string = "all") {
    this.loading = true;
    this.workoutService
      .getProgramsByMuscleGroup(muscleGroup)
      .subscribe((programs) => {
        this.programs = programs;
        this.loading = false;
      });
  }

  /**
   * Carrega todos os programas disponíveis para a funcionalidade de pesquisa e retomada de treinos
   */
  private loadAllProgramsForSearch() {
    this.workoutService
      .getAllPrograms()
      .subscribe((programs) => {
        this.allPrograms = programs;
        console.log('Todos os programas carregados:', this.allPrograms.length);
      });
  }

  /**
   * Manipula eventos de input na barra de pesquisa
   * @param event Evento de input
   */
  onSearchInput(event: any) {
    this.searchTerm = event.target.value || "";
    this.filterPrograms();
  }

  /**
   * Limpa o termo de pesquisa e redefine os resultados
   */
  clearSearch() {
    this.searchTerm = "";
    this.filteredPrograms = [];
  }

  /**
   * Normaliza um texto removendo acentos e convertendo para minúsculas
   * @param text Texto a ser normalizado
   * @returns Texto normalizado
   */
  private normalizeText(text: string): string {
    if (!text) return "";

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^\w\s]/gi, ""); // Remove caracteres especiais
  }

  /**
   * Verifica se um termo de pesquisa está contido em um texto
   * Suporta correspondência parcial e ignora acentos
   * @param haystack Texto onde procurar
   * @param needle Termo a ser procurado
   * @returns Verdadeiro se encontrou correspondência
   */
  private textContains(haystack: string, needle: string): boolean {
    if (!haystack || !needle) return false;

    const normalizedHaystack = this.normalizeText(haystack);
    const normalizedNeedle = this.normalizeText(needle);

    // Dividir termos de pesquisa por espaços para pesquisar múltiplas palavras
    const searchTerms = normalizedNeedle
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Se não houver termos válidos, retorna falso
    if (searchTerms.length === 0) return false;

    // Verificar se todos os termos estão presentes no texto
    return searchTerms.every((term) => normalizedHaystack.includes(term));
  }

  /**
   * Calcula pontuação de relevância para um programa baseado no termo de pesquisa
   * @param program Programa a ser avaliado
   * @param searchTerm Termo de pesquisa
   * @returns Pontuação de relevância (maior = mais relevante)
   */
  private calculateRelevanceScore(
    program: WorkoutProgram,
    searchTerm: string
  ): number {
    let score = 0;
    const normalizedSearchTerm = this.normalizeText(searchTerm);

    // Correspondência exata no nome (alta prioridade)
    if (this.normalizeText(program.nome_programa) === normalizedSearchTerm) {
      score += 100;
    }
    // Correspondência parcial no nome (prioridade média-alta)
    else if (this.textContains(program.nome_programa, searchTerm)) {
      score += 50;
    }

    // Correspondência em tags (prioridade média)
    if (
      program.tags &&
      program.tags.some((tag) => this.textContains(tag, searchTerm))
    ) {
      score += 30;
    }

    // Correspondência na descrição (prioridade média-baixa)
    if (this.textContains(program.descricao, searchTerm)) {
      score += 20;
    }

    // Correspondência em exercícios (prioridade baixa)
    if (
      program.exercicios &&
      program.exercicios.some((ex) => this.textContains(ex.nome, searchTerm))
    ) {
      score += 15;
    }

    // Correspondência em músculos trabalhados (prioridade baixa)
    if (
      program.exercicios &&
      program.exercicios.some(
        (ex) =>
          ex.musculos_trabalhados &&
          ex.musculos_trabalhados.some((m) => this.textContains(m, searchTerm))
      )
    ) {
      score += 10;
    }

    return score;
  }

  /**
   * Filtra programas com base no termo de pesquisa
   * Implementa pesquisa flexível e ordenação por relevância
   */
  private filterPrograms() {
    if (!this.searchTerm || this.searchTerm.trim().length <= 1) {
      this.filteredPrograms = [];
      return;
    }

    // Primeira etapa: encontrar todos os programas com alguma correspondência
    const matchedPrograms = this.allPrograms.filter((program) => {
      // Verificar nome
      if (this.textContains(program.nome_programa, this.searchTerm)) {
        return true;
      }

      // Verificar descrição
      if (this.textContains(program.descricao, this.searchTerm)) {
        return true;
      }

      // Verificar tags
      if (
        program.tags &&
        program.tags.some((tag) => this.textContains(tag, this.searchTerm))
      ) {
        return true;
      }

      // Verificar exercícios
      if (
        program.exercicios &&
        program.exercicios.some((ex) => {
          // Nome do exercício
          if (this.textContains(ex.nome, this.searchTerm)) {
            return true;
          }

          // Músculos trabalhados
          if (
            ex.musculos_trabalhados &&
            ex.musculos_trabalhados.some((m) =>
              this.textContains(m, this.searchTerm)
            )
          ) {
            return true;
          }

          // Dificuldade
          if (this.textContains(ex.dificuldade || "", this.searchTerm)) {
            return true;
          }

          return false;
        })
      ) {
        return true;
      }

      return false;
    });

    // Segunda etapa: calcular pontuação de relevância e ordenar resultados
    this.filteredPrograms = matchedPrograms
      .map((program) => ({
        program,
        score: this.calculateRelevanceScore(program, this.searchTerm),
      }))
      .sort((a, b) => b.score - a.score) // Ordenar por pontuação (maior primeiro)
      .map((item) => item.program);
  }

  async openWorkoutDetail(program: WorkoutProgram) {
    const modal = await this.modalCtrl.create({
      component: WorkoutDetailModalComponent,
      componentProps: {
        program: program,
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: "workout-detail-modal",
    });

    await modal.present();
  }

  /**
   * Exibe uma animação temporária guiando o usuário para selecionar um programa
   */
  startWorkoutGuide() {
    this.showSelectionGuide = true;

    // Rolagem suave até a seção de programas
    setTimeout(() => {
      this.programSection?.nativeElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Remove o guia após 3 segundos
      setTimeout(() => {
        this.showSelectionGuide = false;
      }, 3000);
    }, 100);

    // Aplica uma animação sequencial temporária nos cards
    this.highlightProgramsSequentially();
  }

  /**
   * Destaca os cards de programa de forma sequencial e temporária
   */
  private highlightProgramsSequentially() {
    // Busca todos os cards de programa para destacar
    setTimeout(() => {
      const cards = this.programs.length;

      // Aplica destaque sequencialmente
      for (let i = 0; i < cards; i++) {
        const card = document.getElementById(`program-card-${i}`);
        if (card) {
          // Adiciona classe com atraso proporcional à posição
          setTimeout(() => {
            card.classList.add("highlight-card");

            // Remove a classe após 1.5 segundos
            setTimeout(() => {
              card.classList.remove("highlight-card");
            }, 1500);
          }, i * 200); // Intervalo de 200ms entre cards
        }
      }
    }, 500); // Pequeno atraso para garantir que a rolagem já começou
  }
  
  /**
   * Verifica se existe um treino pendente e carrega seus dados
   */
  private checkPendingWorkout() {
    this.hasPendingWorkout = this.workoutProgressService.hasPendingWorkout();
    if (this.hasPendingWorkout) {
      this.pendingWorkout = this.workoutProgressService.getCurrentWorkout();
      console.log('Treino pendente encontrado:', this.pendingWorkout);
    }
  }
  
  checkActiveWorkout() {
    // Verificar se há um treino em andamento (não pendente)
    const currentWorkout = this.workoutProgressService.getCurrentWorkout();
    this.hasActiveWorkout = !!currentWorkout && !currentWorkout.isPending;
    if (this.hasActiveWorkout) {
      this.activeWorkout = currentWorkout;
      console.log('Treino em andamento encontrado:', this.activeWorkout);
    }
  }
  
  /**
   * Retoma um treino pendente
   * @param workout Treino pendente a ser retomado
   */
  async resumePendingWorkout(workout: WorkoutSession) {
    console.log('Retomando treino pendente:', workout);
    try {
      // Verificar se temos programas carregados
      if (!this.allPrograms || this.allPrograms.length === 0) {
        console.error('Nenhum programa carregado. Recarregando programas...');
        await new Promise<void>((resolve) => {
          this.workoutService.getAllPrograms().subscribe(programs => {
            this.allPrograms = programs;
            console.log('Programas recarregados:', this.allPrograms.length);
            resolve();
          });
        });
      }
      
      console.log('Procurando programa com nome:', workout.programName);
      console.log('Programas disponíveis:', this.allPrograms.map(p => p.nome_programa));
      
      // Buscar o programa completo baseado no nome do programa pendente
      const program = this.allPrograms.find(p => p.nome_programa === workout.programName);
      
      if (!program) {
        console.error('Programa não encontrado:', workout.programName);
        await this.showToast('Não foi possível encontrar o programa deste treino.');
        return;
      }
      
      console.log('Programa encontrado:', program);
      
      // Retoma o treino pendente no serviço
      this.workoutProgressService.resumePendingWorkout();
      
      // Abrir o modal com o programa e indicar que estamos retomando um treino
      const modal = await this.modalCtrl.create({
        component: WorkoutDetailModalComponent,
        componentProps: {
          program: program,
          resumingWorkout: true
        },
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        cssClass: "workout-detail-modal",
      });
      
      await modal.present();
      
      // Atualizar a lista de treinos pendentes após o fechamento do modal
      modal.onDidDismiss().then(() => {
        this.checkPendingWorkout();
        this.checkActiveWorkout();
      });
    } catch (error) {
      console.error('Erro ao retomar treino:', error);
      await this.showToast('Ocorreu um erro ao retomar o treino.');
    }
  }
  
  async continueActiveWorkout(workout: WorkoutSession) {
    console.log('Continuando treino em andamento:', workout);
    try {
      // Verificar se temos programas carregados
      if (!this.allPrograms || this.allPrograms.length === 0) {
        console.error('Nenhum programa carregado. Recarregando programas...');
        await new Promise<void>((resolve) => {
          this.workoutService.getAllPrograms().subscribe(programs => {
            this.allPrograms = programs;
            console.log('Programas recarregados:', this.allPrograms.length);
            resolve();
          });
        });
      }
      
      console.log('Procurando programa com nome:', workout.programName);
      console.log('Programas disponíveis:', this.allPrograms.map(p => p.nome_programa));
      
      // Buscar o programa completo baseado no nome do programa
      const program = this.allPrograms.find(p => p.nome_programa === workout.programName);
      
      if (!program) {
        console.error('Programa não encontrado:', workout.programName);
        await this.showToast('Não foi possível encontrar o programa deste treino.');
        return;
      }
      
      console.log('Programa encontrado:', program);
      
      // Abrir o modal com o programa e indicar que estamos continuando um treino em andamento
      const modal = await this.modalCtrl.create({
        component: WorkoutDetailModalComponent,
        componentProps: {
          program: program,
          continuingWorkout: true
        },
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        cssClass: "workout-detail-modal",
      });
      
      await modal.present();
      
      // Atualizar a lista de treinos em andamento após o fechamento do modal
      modal.onDidDismiss().then(() => {
        this.checkActiveWorkout();
        this.checkPendingWorkout();
      });
    } catch (error) {
      console.error('Erro ao continuar treino:', error);
      await this.showToast('Ocorreu um erro ao continuar o treino.');
    }
  }
  
  async confirmDeletePendingWorkout(workout: WorkoutSession) {
    const alert = await this.alertController.create({
      header: 'Eliminar treino pendente',
      message: 'Tens a certeza que queres eliminar este treino pendente? Esta ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim, eliminar',
          role: 'destructive',
          handler: () => {
            this.deletePendingWorkout();
          }
        }
      ]
    });

    await alert.present();
  }
  
  async confirmCancelActiveWorkout(workout: WorkoutSession) {
    const alert = await this.alertController.create({
      header: 'Cancelar treino em andamento',
      message: 'Tens a certeza que queres cancelar este treino? O progresso será perdido.',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim, cancelar',
          role: 'destructive',
          handler: () => {
            this.cancelActiveWorkout();
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  /**
   * Elimina um treino pendente
   */
  private async deletePendingWorkout() {
    // Finaliza o treino atual (o que efetivamente remove o estado pendente)
    this.workoutProgressService.finishWorkout(true);
    this.checkPendingWorkout();
    await this.showToast('Treino pendente eliminado com sucesso.');
  }
  
  async cancelActiveWorkout() {
    // Finaliza o treino atual
    this.workoutProgressService.finishWorkout(true);
    this.checkActiveWorkout();
    await this.showToast('Treino em andamento cancelado com sucesso.');
  }
  
  /**
   * Exibe uma mensagem toast para o utilizador
   */
  private async showToast(message: string, color: string = 'success', duration: number = 2000): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
