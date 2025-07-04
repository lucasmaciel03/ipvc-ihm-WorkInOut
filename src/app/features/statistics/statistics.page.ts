import { Component, OnInit } from '@angular/core';
import { WorkoutProgressService, WorkoutSession } from '../../core/services/workout-progress.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

// Interface para as abas de métricas
interface MetricTab {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  value?: number;
  unit?: string;
}

// Estender a interface WorkoutSession para incluir as propriedades personalizadas
interface ExtendedWorkoutSession extends WorkoutSession {
  calories?: number;
  heartRate?: number;
  bpm?: number;
  sets?: string;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DatePipe]
})
export class StatisticsPage implements OnInit {
  // Abas de métricas
  metricTabs: MetricTab[] = [
    {
      id: 'calories',
      name: 'Calorias',
      icon: 'flame-outline',
      active: true,
      value: 0,
      unit: 'kcal'
    },
    {
      id: 'heart-rate',
      name: 'Freq. Cardíaca',
      icon: 'heart-outline',
      active: false,
      value: 0,
      unit: 'bpm'
    },
    {
      id: 'duration',
      name: 'Duração',
      icon: 'time-outline',
      active: false,
      value: 0,
      unit: 'min'
    }
  ];
  
  // Histórico de treinos
  workoutHistory: ExtendedWorkoutSession[] = [];
  
  // Dados para o gráfico de barras
  chartValues: number[] = [];
  weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  // Estatísticas gerais
  totalCaloriesBurned = 0;
  averageHeartRate = 0;
  averageBpm = 0;
  totalWorkouts = 0;
  totalDuration = 0;
  
  constructor(private workoutProgressService: WorkoutProgressService) {}
  
  ngOnInit() {
    this.loadWorkoutHistory();
  }
  
  /**
   * Carrega o histórico de treinos e calcula estatísticas
   */
  loadWorkoutHistory() {
    // Obter histórico do serviço
    const history = this.workoutProgressService.getWorkoutHistory();
    
    console.log('Histórico de treinos bruto:', history);
    
    // Filtrar apenas treinos completos
    const completedWorkouts = history.filter(workout => workout.completed);
    
    // Converter para ExtendedWorkoutSession
    this.workoutHistory = completedWorkouts.map(workout => {
      // Verificar se as calorias estão definidas e não são zero
      let caloriesValue = workout.caloriesEstimated;
      
      // Se as calorias forem 0, calcular com base na duração e exercícios completados
      if (!caloriesValue || caloriesValue === 0) {
        const durationMinutes = Math.floor(workout.duration / 60);
        caloriesValue = (durationMinutes * 4) + (workout.completedExercises * 15);
      }
      
      // Gerar valores realistas para as métricas com base nos dados existentes
      const heartRate = Math.floor((caloriesValue / 10) + Math.random() * 20 + 70); // Baseado nas calorias
      const bpm = Math.floor((workout.duration / 60) + Math.random() * 5 + 10); // Baseado na duração
      
      return {
        ...workout,
        // Adicionar propriedades extras para visualização
        calories: caloriesValue,
        heartRate: heartRate,
        bpm: bpm,
        sets: workout.completedExercises > 0 ? `${workout.completedExercises} x ${Math.floor(workout.totalExercises / workout.completedExercises) + 5} reps` : undefined
      } as ExtendedWorkoutSession;
    });
    
    // Ordenar por data mais recente
    this.workoutHistory.sort((a, b) => {
      const dateA = a.endTime ? new Date(a.endTime).getTime() : 0;
      const dateB = b.endTime ? new Date(b.endTime).getTime() : 0;
      return dateB - dateA; // Ordem decrescente (mais recente primeiro)
    });
    
    console.log('Histórico de treinos carregado:', this.workoutHistory);
    
    // Se não houver histórico, adicionar dados simulados para demonstração
    if (this.workoutHistory.length === 0) {
      this.addDemoWorkouts();
    }
    
    // Calcular estatísticas gerais
    this.calculateStatistics();
    
    // Gerar dados para o gráfico
    this.generateChartData();
  }
  
  /**
   * Adiciona treinos simulados para demonstração
   */
  private addDemoWorkouts() {
    // Limpar histórico existente para evitar duplicações
    this.workoutProgressService.clearWorkoutHistory();
    
    // Criar treinos de demonstração com valores realistas
    const demoWorkouts: ExtendedWorkoutSession[] = [
      {
        id: 'demo1',
        programId: 'chest-program',
        programName: 'Treino de Peito',
        startTime: new Date('2024-07-01T10:00:00'),
        endTime: new Date('2024-07-01T10:30:00'),
        duration: 1800, // 30 minutos em segundos
        completed: true,
        isPending: false,
        completedExercises: 5,
        totalExercises: 5,
        lastUpdated: new Date('2024-07-01T10:30:00'),
        exercisesProgress: [],
        caloriesEstimated: 195, // (30 minutos * 4) + (5 exercícios * 15) = 120 + 75 = 195
        // Propriedades personalizadas para a visualização
        calories: 195,
        heartRate: 99,
        bpm: 18,
        sets: '3 x 12 reps'
      },
      {
        id: 'demo2',
        programId: 'back-program',
        programName: 'Treino de Costas',
        startTime: new Date('2024-07-02T18:00:00'),
        endTime: new Date('2024-07-02T18:45:00'),
        duration: 2700, // 45 minutos em segundos
        completed: true,
        isPending: false,
        completedExercises: 4,
        totalExercises: 4,
        lastUpdated: new Date('2024-07-02T18:45:00'),
        exercisesProgress: [],
        caloriesEstimated: 240, // (45 minutos * 4) + (4 exercícios * 15) = 180 + 60 = 240
        // Propriedades personalizadas para a visualização
        calories: 240,
        heartRate: 102,
        bpm: 19,
        sets: '4 x 10 reps'
      },
      {
        id: 'demo3',
        programId: 'legs-program',
        programName: 'Treino de Pernas',
        startTime: new Date('2024-07-03T18:00:00'),
        endTime: new Date('2024-07-03T19:00:00'),
        duration: 3600, // 60 minutos em segundos
        completed: true,
        isPending: false,
        completedExercises: 6,
        totalExercises: 6,
        lastUpdated: new Date('2024-07-03T19:00:00'),
        exercisesProgress: [],
        caloriesEstimated: 330, // (60 minutos * 4) + (6 exercícios * 15) = 240 + 90 = 330
        // Propriedades personalizadas para a visualização
        calories: 330,
        heartRate: 105,
        bpm: 20,
        sets: '4 x 10 reps'
      },
      {
        id: 'demo4',
        programId: 'cardio-program',
        programName: 'Treino Cardio',
        startTime: new Date('2024-07-04T07:00:00'),
        endTime: new Date('2024-07-04T07:20:00'),
        duration: 1200, // 20 minutos em segundos
        completed: true,
        isPending: false,
        completedExercises: 3,
        totalExercises: 3,
        lastUpdated: new Date('2024-07-04T07:20:00'),
        exercisesProgress: [],
        caloriesEstimated: 125, // (20 minutos * 4) + (3 exercícios * 15) = 80 + 45 = 125
        // Propriedades personalizadas para a visualização
        calories: 125,
        heartRate: 110,
        bpm: 22,
        sets: '3 x 15 reps'
      }
    ];
    
    // Salvar os treinos de demonstração no histórico
    demoWorkouts.forEach(workout => {
      this.workoutProgressService.saveWorkoutToHistory(workout);
    });
    
    // Atualizar o histórico local
    this.workoutHistory = demoWorkouts;
  }
  
  /**
   * Seleciona uma aba de métrica
   */
  selectMetricTab(selectedTab: MetricTab) {
    this.metricTabs.forEach(tab => {
      tab.active = tab.id === selectedTab.id;
    });
    
    // Atualizar a métrica ativa com os dados calculados
    this.updateActiveMetric();
    
    // Regenerar os dados do gráfico com base na nova métrica selecionada
    this.generateChartData();
  }
  
  /**
   * Formata a duração em segundos para o formato MM:SS
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Calcula estatísticas gerais com base no histórico de treinos
   */
  calculateStatistics() {
    if (this.workoutHistory.length === 0) return;
    
    this.totalWorkouts = this.workoutHistory.length;
    
    // Calcular total de calorias queimadas
    this.totalCaloriesBurned = this.workoutHistory.reduce((total, workout) => {
      return total + (workout.calories || 0);
    }, 0);
    
    // Calcular média de frequência cardíaca
    const totalHeartRate = this.workoutHistory.reduce((total, workout) => {
      return total + (workout.heartRate || 0);
    }, 0);
    this.averageHeartRate = Math.round(totalHeartRate / this.totalWorkouts);
    
    // Calcular média de BPM
    const totalBpm = this.workoutHistory.reduce((total, workout) => {
      return total + (workout.bpm || 0);
    }, 0);
    this.averageBpm = Math.round(totalBpm / this.totalWorkouts);
    
    // Calcular duração total dos treinos
    this.totalDuration = this.workoutHistory.reduce((total, workout) => {
      return total + (workout.duration || 0);
    }, 0);
    
    // Atualizar a aba ativa com os dados calculados
    this.updateActiveMetric();
  }
  
  /**
   * Gera dados para o gráfico com base no histórico de treinos
   */
  generateChartData() {
    // Resetar valores do gráfico
    this.chartValues = [0, 0, 0, 0, 0, 0, 0];
    
    if (this.workoutHistory.length === 0) return;
    
    // Obter a data atual
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Ajustar para que a semana comece na segunda-feira (0 = Segunda, ..., 6 = Domingo)
    const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1;
    
    // Calcular o início da semana (segunda-feira)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - adjustedCurrentDay);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Para cada treino na última semana, adicionar ao gráfico
    this.workoutHistory.forEach(workout => {
      if (!workout.endTime) return;
      
      const workoutDate = new Date(workout.endTime);
      
      // Verificar se o treino está na semana atual
      if (workoutDate >= startOfWeek) {
        // Calcular o dia da semana (0 = Segunda, ..., 6 = Domingo)
        const workoutDay = workoutDate.getDay();
        const adjustedWorkoutDay = workoutDay === 0 ? 6 : workoutDay - 1;
        
        // Obter a métrica ativa
        const activeMetric = this.metricTabs.find(tab => tab.active);
        
        // Adicionar valor ao gráfico com base na métrica selecionada
        if (activeMetric) {
          switch (activeMetric.id) {
            case 'calories':
              this.chartValues[adjustedWorkoutDay] += workout.calories || 0;
              break;
            case 'heart-rate':
              // Se já existe um valor, fazer a média
              if (this.chartValues[adjustedWorkoutDay] > 0) {
                this.chartValues[adjustedWorkoutDay] = Math.round(
                  (this.chartValues[adjustedWorkoutDay] + (workout.heartRate || 0)) / 2
                );
              } else {
                this.chartValues[adjustedWorkoutDay] = workout.heartRate || 0;
              }
              break;
            case 'duration':
              this.chartValues[adjustedWorkoutDay] += workout.duration / 60 || 0; // Converter para minutos
              break;
          }
        }
      }
    });
    
    // Normalizar os valores para ficarem entre 0-100 para exibição no gráfico
    const maxValue = Math.max(...this.chartValues, 1); // Evitar divisão por zero
    this.chartValues = this.chartValues.map(value => Math.round((value / maxValue) * 100));
  }
  
  /**
   * Atualiza todas as métricas com base nas estatísticas calculadas
   */
  updateActiveMetric() {
    // Atualizar os valores de todas as abas
    this.metricTabs.forEach(tab => {
      switch (tab.id) {
        case 'calories':
          tab.value = this.totalCaloriesBurned;
          tab.unit = 'kcal';
          break;
        case 'heart-rate':
          tab.value = this.averageHeartRate;
          tab.unit = 'bpm';
          break;
        case 'duration':
          tab.value = Math.round(this.totalDuration / 60); // Converter para minutos
          tab.unit = 'min';
          break;
      }
    });
  }
  
  /**
   * Navega para a página de detalhes do histórico completo
   */
  viewAllHistory() {
    console.log('Ver histórico completo');
    // Implementar navegação para página de histórico completo
  }
}
