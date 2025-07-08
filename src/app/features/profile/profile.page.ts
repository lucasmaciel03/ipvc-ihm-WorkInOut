import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { AuthService, User } from "../../core/services/auth.service";
import { WorkoutProgressService, WorkoutSession } from "../../core/services/workout-progress.service";
import { GoalSelectionModalComponent } from '../../components/goal-selection-modal/goal-selection-modal.component';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  recentWorkouts: WorkoutSession[] = [];
  completedWorkouts: number = 0;
  totalCaloriesBurned: number = 0;
  totalMinutesWorkedOut: number = 0;
  
  constructor(
    private authService: AuthService,
    private workoutProgressService: WorkoutProgressService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    this.loadUserData();
    this.loadWorkoutStats();
  }
  
  ionViewWillEnter() {
    // Recarregar dados sempre que a página for exibida
    this.loadUserData();
    this.loadWorkoutStats();
  }
  
  /**
   * Carrega os dados do utilizador atual
   */
  loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
  
  /**
   * Carrega as estatísticas de treino e atividades recentes
   */
  loadWorkoutStats() {
    // Obter histórico de treinos
    const workoutHistory = this.workoutProgressService.getWorkoutHistory();
    
    // Filtrar apenas treinos completos
    const completedSessions = workoutHistory.filter(session => session.completed);
    
    // Calcular estatísticas
    this.completedWorkouts = completedSessions.length;
    this.totalCaloriesBurned = completedSessions.reduce((total, session) => total + session.caloriesEstimated, 0);
    this.totalMinutesWorkedOut = Math.round(completedSessions.reduce((total, session) => total + session.duration, 0) / 60);
    
    // Obter os 5 treinos mais recentes
    this.recentWorkouts = [...completedSessions]
      .sort((a, b) => new Date(b.endTime || 0).getTime() - new Date(a.endTime || 0).getTime())
      .slice(0, 5);
  }
  
  /**
   * Obtém as iniciais do nome do utilizador para o avatar
   */
  getUserInitials(): string {
    if (!this.user?.name) return '?';
    
    const nameParts = this.user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
  
  /**
   * Calcula o IMC do utilizador
   */
  calculateBMI(): string {
    if (!this.user?.height || !this.user?.weight) return '-';
    
    const heightInMeters = this.user.height / 100;
    const bmi = this.user.weight / (heightInMeters * heightInMeters);
    
    return bmi.toFixed(1);
  }
  
  /**
   * Formata a duração em segundos para formato legível
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 1) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  /**
   * Obtém a classe CSS para o ícone do objetivo
   */
  getGoalClass(goal: string | undefined | null): string {
    if (!goal) return '';
    
    switch (goal) {
      case 'gain_muscle': return 'goal-muscle';
      case 'lose_weight': return 'goal-weight';
      case 'improve_fitness': return 'goal-fitness';
      default: return '';
    }
  }
  
  /**
   * Obtém o ícone para o objetivo
   */
  getGoalIcon(goal: string | undefined | null): string {
    if (!goal) return 'flag-outline';
    
    switch (goal) {
      case 'gain_muscle': return 'barbell-outline';
      case 'lose_weight': return 'trending-down-outline';
      case 'improve_fitness': return 'fitness-outline';
      default: return 'flag-outline';
    }
  }
  
  /**
   * Obtém o nome do objetivo em português
   */
  getGoalName(goal: string | undefined | null): string {
    if (!goal) return 'Objetivo não definido';
    
    switch (goal) {
      case 'gain_muscle': return 'Ganhar Músculo';
      case 'lose_weight': return 'Perder Peso';
      case 'improve_fitness': return 'Melhorar Condição Física';
      default: return 'Objetivo não definido';
    }
  }
  
  /**
   * Obtém a descrição do objetivo
   */
  getGoalDescription(goal: string | undefined | null): string {
    if (!goal) return '';
    
    switch (goal) {
      case 'gain_muscle': 
        return 'Foco em exercícios de força e hipertrofia para aumentar a massa muscular.';
      case 'lose_weight': 
        return 'Combinação de exercícios cardiovasculares e de força para queimar calorias e perder peso.';
      case 'improve_fitness': 
        return 'Treinos variados para melhorar a resistência, flexibilidade e condição física geral.';
      default: 
        return '';
    }
  }
  
  /**
   * Abre o modal para editar o perfil
   */
  async editProfile() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nome',
          value: this.user?.name
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.user?.email
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (this.user && data.name && data.email) {
              const updatedUser = {
                ...this.user,
                name: data.name,
                email: data.email
              };
              
              this.authService.updateUser(updatedUser);
              this.showToast('Perfil atualizado com sucesso!');
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  /**
   * Abre o modal para atualizar informações físicas
   */
  async updatePhysicalInfo() {
    const alert = await this.alertController.create({
      header: 'Informações Físicas',
      inputs: [
        {
          name: 'age',
          type: 'number',
          placeholder: 'Idade',
          value: this.user?.age
        },
        {
          name: 'height',
          type: 'number',
          placeholder: 'Altura (cm)',
          value: this.user?.height
        },
        {
          name: 'weight',
          type: 'number',
          placeholder: 'Peso (kg)',
          value: this.user?.weight
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (this.user) {
              const updatedUser = {
                ...this.user,
                age: data.age ? parseInt(data.age) : undefined,
                height: data.height ? parseInt(data.height) : undefined,
                weight: data.weight ? parseFloat(data.weight) : undefined
              };
              
              this.authService.updateUser(updatedUser);
              this.showToast('Informações físicas atualizadas!');
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  /**
   * Abre o alerta para alterar o objetivo principal
   */
  async changeGoal() {
    try {
      console.log('Abrindo alerta de seleção de objetivo');
      console.log('Objetivo atual:', this.user?.primaryGoal);
      
      const alert = await this.alertController.create({
        header: 'Escolhe o teu objetivo',
        cssClass: 'custom-alert',
        inputs: [
          {
            name: 'lose_weight',
            type: 'radio',
            label: 'Perder Peso',
            value: 'lose_weight',
            checked: this.user?.primaryGoal === 'lose_weight'
          },
          {
            name: 'gain_muscle',
            type: 'radio',
            label: 'Ganhar Músculo',
            value: 'gain_muscle',
            checked: this.user?.primaryGoal === 'gain_muscle'
          },
          {
            name: 'improve_fitness',
            type: 'radio',
            label: 'Ficar em Forma',
            value: 'improve_fitness',
            checked: this.user?.primaryGoal === 'improve_fitness'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar',
            handler: (goalId) => {
              if (goalId && this.user) {
                const updatedUser = {
                  ...this.user,
                  primaryGoal: goalId
                };
                
                this.authService.updateUser(updatedUser);
                this.showToast('Objetivo atualizado com sucesso!');
              }
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Erro ao abrir alerta:', error);
      this.showToast('Ocorreu um erro ao abrir o alerta de seleção de objetivo.');
    }
  }
  
  /**
   * Abre o modal para alterar a foto de perfil
   */
  async changePhoto() {
    // Em uma aplicação real, aqui seria implementado o upload de foto
    // Como é um protótipo, vamos apenas mostrar uma mensagem
    this.showToast('Funcionalidade de upload de foto será implementada em breve!');
  }
  
  /**
   * Abre as configurações da aplicação
   */
  openSettings() {
    // Em uma aplicação real, aqui seria implementada a navegação para as configurações
    this.showToast('Configurações serão implementadas em breve!');
  }
  
  /**
   * Exibe uma mensagem toast
   */
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    
    await toast.present();
  }
}
