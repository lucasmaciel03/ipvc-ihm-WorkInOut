import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { WorkoutService, WorkoutProgram } from '../../services/workout.service';
import { WorkoutDetailModalComponent } from '../../components/workout-detail-modal/workout-detail-modal.component';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  selectedSegment = 'all';
  muscleGroups: string[] = [];
  programs: WorkoutProgram[] = [];
  loading = true;

  constructor(
    private workoutService: WorkoutService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadMuscleGroups();
    this.loadPrograms('all'); // Começar mostrando todos os programas
  }

  private loadMuscleGroups() {
    this.workoutService.getAllMuscleGroups().subscribe(groups => {
      this.muscleGroups = groups;
    });
  }

  onSegmentChange(event: any) {
    const muscleGroup = event.detail.value;
    this.loadPrograms(muscleGroup);
  }

  private loadPrograms(muscleGroup: string) {
    this.loading = true;
    this.workoutService.getProgramsByMuscleGroup(muscleGroup).subscribe(programs => {
      this.programs = programs;
      this.loading = false;
    });
  }

  async openWorkoutDetail(program: WorkoutProgram) {
    const modal = await this.modalCtrl.create({
      component: WorkoutDetailModalComponent,
      componentProps: {
        program: program
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'workout-detail-modal'
    });

    await modal.present();
  }

}
