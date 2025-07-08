import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-goal-selection-modal',
  templateUrl: './goal-selection-modal.component.html',
  styleUrls: ['./goal-selection-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GoalSelectionModalComponent implements OnInit {
  selectedGoalId: string | null = null;
  
  @Input() currentGoalId: string | null = null;
  
  // Definir os IDs dos objetivos disponíveis para garantir consistência
  readonly GOAL_LOSE_WEIGHT = 'lose_weight';
  readonly GOAL_GAIN_MUSCLE = 'gain_muscle';
  readonly GOAL_IMPROVE_FITNESS = 'improve_fitness';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Inicializar a seleção com o objetivo atual
    if (this.currentGoalId) {
      this.selectedGoalId = this.currentGoalId;
      console.log('Objetivo atual:', this.currentGoalId);
    }
  }

  /**
   * Seleciona um objetivo
   */
  selectGoal(goalId: string) {
    this.selectedGoalId = goalId;
  }

  /**
   * Confirma a seleção e fecha o modal
   */
  confirmSelection() {
    this.modalCtrl.dismiss({
      goalId: this.selectedGoalId
    });
  }

  /**
   * Cancela a seleção e fecha o modal
   */
  cancel() {
    this.modalCtrl.dismiss();
  }
}
