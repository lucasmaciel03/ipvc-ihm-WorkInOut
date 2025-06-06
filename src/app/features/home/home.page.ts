import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { register } from "swiper/element/bundle";
import { WorkoutService, WorkoutProgram } from "../../services/workout.service";
import { WorkoutDetailModalComponent } from "../../components/workout-detail-modal/workout-detail-modal.component";

register();

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: false,
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

  constructor(
    private workoutService: WorkoutService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadMuscleGroups();
    this.loadPrograms("all"); // Começar mostrando todos os programas
    this.loadAllProgramsForSearch();
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

  private loadPrograms(muscleGroup: string) {
    this.loading = true;
    this.workoutService
      .getProgramsByMuscleGroup(muscleGroup)
      .subscribe((programs) => {
        this.programs = programs;
        this.loading = false;
      });
  }

  /**
   * Carrega todos os programas disponíveis para a funcionalidade de pesquisa
   */
  private loadAllProgramsForSearch() {
    this.workoutService
      .getProgramsByMuscleGroup("all")
      .subscribe((programs) => {
        this.allPrograms = programs;
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
}
