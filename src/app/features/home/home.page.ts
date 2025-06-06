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

  constructor(
    private workoutService: WorkoutService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadMuscleGroups();
    this.loadPrograms("all"); // Começar mostrando todos os programas
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
