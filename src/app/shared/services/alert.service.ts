import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomAlertOptions } from '../components/custom-alert/custom-alert.component';

@Injectable({
  providedIn: 'root'
})
export class CustomAlertService {
  private alertSubject = new BehaviorSubject<{ isOpen: boolean; options: CustomAlertOptions | null }>({
    isOpen: false,
    options: null
  });

  alert$ = this.alertSubject.asObservable();

  /**
   * Shows a workout completion alert
   */
  showWorkoutComplete(exercisesCompleted: number, totalExercises: number, onContinue?: () => void, onFinish?: () => void) {
    const options: CustomAlertOptions = {
      header: '🎉 Parabéns!',
      subHeader: `${exercisesCompleted}/${totalExercises} exercícios concluídos`,
      message: 'Estás a fazer um excelente trabalho!<br><strong>Continuar</strong> ou <strong>terminar</strong> treino?',
      icon: 'trophy-outline',
      iconColor: '#4CAF50',
      cssClass: 'workout-complete',
      buttons: [
        {
          text: 'Continuar Treino',
          role: 'confirm',
          cssClass: 'motivational-btn',
          handler: onContinue
        },
        {
          text: 'Terminar Aqui',
          role: 'cancel',
          handler: onFinish
        }
      ]
    };

    this.show(options);
  }

  /**
   * Shows a workout exit warning
   */
  showWorkoutExitWarning(exercisesRemaining: number, onExit?: () => void, onStay?: () => void) {
    const options: CustomAlertOptions = {
      header: '⚠️ Terminar Treino?',
      subHeader: `Ainda tens ${exercisesRemaining} exercício${exercisesRemaining > 1 ? 's' : ''} por completar`,
      message: 'Tens a certeza que queres sair?<br>O teu progresso <strong>não será guardado</strong>.',
      icon: 'warning-outline',
      iconColor: '#FF9800',
      cssClass: 'workout-warning',
      buttons: [
        {
          text: 'Continuar Treino',
          role: 'cancel',
          cssClass: 'motivational-btn',
          handler: onStay
        },
        {
          text: 'Sair Mesmo Assim',
          role: 'destructive',
          handler: onExit
        }
      ]
    };

    this.show(options);
  }

  /**
   * Shows a motivational rest alert
   */
  showRestMotivation(nextExercise: string, onReady?: () => void, onNeedMoreTime?: () => void) {
    const motivationalMessages = [
      'Estás a arrasar! 💪',
      'Força, campeão! 🔥',
      'Quase lá! Não desistas! ⚡',
      'Tu consegues! 💯',
      'Mantém o foco! 🎯'
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    const options: CustomAlertOptions = {
      header: randomMessage,
      subHeader: 'Tempo de descanso',
      message: `Próximo exercício: <strong>${nextExercise}</strong><br>Estás pronto para continuar?`,
      icon: 'time-outline',
      iconColor: '#2196F3',
      cssClass: 'motivational',
      buttons: [
        {
          text: 'Estou Pronto! 🚀',
          role: 'confirm',
          cssClass: 'motivational-btn',
          handler: onReady
        },
        {
          text: 'Mais 30s',
          role: 'cancel',
          handler: onNeedMoreTime
        }
      ]
    };

    this.show(options);
  }

  /**
   * Shows a custom alert
   */
  show(options: CustomAlertOptions) {
    this.alertSubject.next({ isOpen: true, options });
  }

  /**
   * Dismisses the current alert
   */
  dismiss() {
    this.alertSubject.next({ isOpen: false, options: null });
  }
}
