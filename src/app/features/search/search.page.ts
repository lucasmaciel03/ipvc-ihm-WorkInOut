import { Component, OnInit } from "@angular/core";
import { WorkoutService, WorkoutProgram } from "../../services/workout.service";

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
  standalone: false,
})
export class SearchPage implements OnInit {
  // Termos de pesquisa e resultados
  searchTerm: string = "";
  filteredPrograms: WorkoutProgram[] = [];
  allPrograms: WorkoutProgram[] = [];
  
  // Opções de filtro
  muscleGroups: FilterOption[] = [
    { id: 'all', label: 'Todos', active: true },
    { id: 'Peito', label: 'Peito', active: false },
    { id: 'Costas', label: 'Costas', active: false },
    { id: 'Pernas', label: 'Pernas', active: false },
    { id: 'Ombros', label: 'Ombros', active: false },
    { id: 'Bíceps', label: 'Bíceps', active: false },
    { id: 'Tríceps', label: 'Tríceps', active: false },
    { id: 'Abdominais', label: 'Abdominais', active: false }
  ];
  
  difficultyLevels: FilterOption[] = [
    { id: 'all', label: 'Todas', active: true },
    { id: 'Iniciante', label: 'Iniciante', active: false },
    { id: 'Intermédio', label: 'Intermédio', active: false },
    { id: 'Avançado', label: 'Avançado', active: false }
  ];
  
  workoutGoals: FilterOption[] = [
    { id: 'all', label: 'Todos', active: true },
    { id: 'Ganhar Músculo', label: 'Ganhar Músculo', active: false },
    { id: 'Perder Peso', label: 'Perder Peso', active: false },
    { id: 'Ficar em Forma', label: 'Ficar em Forma', active: false }
  ];
  
  // Estado dos filtros
  showFilters: boolean = false;
  activeFilters: number = 0;
  isLoading: boolean = true;

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
    this.loadAllPrograms();
  }

  /**
   * Carrega todos os programas de todos os objetivos
   */
  private loadAllPrograms() {
    this.isLoading = true;
    this.workoutService.getAllPrograms().subscribe(programs => {
      this.allPrograms = programs;
      this.filteredPrograms = [...programs];
      this.isLoading = false;
    });
  }

  /**
   * Filtra programas com base no termo de pesquisa e filtros ativos
   */
  filterPrograms() {
    const term = this.searchTerm?.toLowerCase() ?? '';
    
    // Obter filtros ativos
    const activeMuscleGroups = this.muscleGroups
      .filter(group => group.active && group.id !== 'all')
      .map(group => group.id);
      
    const activeDifficulties = this.difficultyLevels
      .filter(level => level.active && level.id !== 'all')
      .map(level => level.id);
      
    const activeGoals = this.workoutGoals
      .filter(goal => goal.active && goal.id !== 'all')
      .map(goal => goal.id);
    
    // Contar filtros ativos para mostrar indicador
    this.activeFilters = activeMuscleGroups.length + activeDifficulties.length + activeGoals.length;

    // Aplicar filtros
    this.filteredPrograms = this.allPrograms.filter(program => {
      const nome = program.nome_programa?.toLowerCase() ?? '';
      const descricao = program.descricao?.toLowerCase() ?? '';
      const tags = program.tags ?? [];
      // Usar reduce em vez de flatMap para compatibilidade
      const musculos = program.exercicios ? 
        program.exercicios.reduce((acc: string[], ex) => [...acc, ...ex.musculos_trabalhados], []) : 
        [];
      const dificuldade = program.pre_requisitos?.nivel_minimo ?? '';
      
      // Verificar termo de pesquisa
      const matchesTerm = term === '' || 
        nome.includes(term) || 
        descricao.includes(term) || 
        tags.some(tag => tag?.toLowerCase()?.includes(term));
      
      // Verificar filtros de grupo muscular
      const matchesMuscleGroup = activeMuscleGroups.length === 0 || 
        musculos.some((musculo: string) => activeMuscleGroups.includes(musculo));
      
      // Verificar filtros de dificuldade
      const matchesDifficulty = activeDifficulties.length === 0 || 
        activeDifficulties.includes(dificuldade);
      
      // Verificar filtros de objetivo
      // Nota: Precisamos extrair o objetivo do programa com base em alguma lógica
      // Por enquanto, vamos usar as tags como aproximação
      const matchesGoal = activeGoals.length === 0 || 
        activeGoals.some(goal => tags.includes(goal.toLowerCase()));
      
      return matchesTerm && matchesMuscleGroup && matchesDifficulty && matchesGoal;
    });
  }

  /**
   * Alterna a seleção de um filtro
   */
  toggleFilter(filter: FilterOption, filterType: 'muscle' | 'difficulty' | 'goal') {
    // Se estamos ativando 'all', desativar todos os outros
    if (filter.id === 'all') {
      if (filterType === 'muscle') {
        this.muscleGroups.forEach(g => g.active = g.id === 'all');
      } else if (filterType === 'difficulty') {
        this.difficultyLevels.forEach(d => d.active = d.id === 'all');
      } else if (filterType === 'goal') {
        this.workoutGoals.forEach(g => g.active = g.id === 'all');
      }
    } else {
      // Estamos ativando um filtro específico
      filter.active = !filter.active;
      
      // Desativar 'all' se algum filtro específico estiver ativo
      if (filterType === 'muscle') {
        const hasActiveSpecific = this.muscleGroups.some(g => g.id !== 'all' && g.active);
        this.muscleGroups.find(g => g.id === 'all')!.active = !hasActiveSpecific;
      } else if (filterType === 'difficulty') {
        const hasActiveSpecific = this.difficultyLevels.some(d => d.id !== 'all' && d.active);
        this.difficultyLevels.find(d => d.id === 'all')!.active = !hasActiveSpecific;
      } else if (filterType === 'goal') {
        const hasActiveSpecific = this.workoutGoals.some(g => g.id !== 'all' && g.active);
        this.workoutGoals.find(g => g.id === 'all')!.active = !hasActiveSpecific;
      }
    }
    
    // Aplicar filtros
    this.filterPrograms();
  }
  
  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.searchTerm = '';
    this.muscleGroups.forEach(g => g.active = g.id === 'all');
    this.difficultyLevels.forEach(d => d.active = d.id === 'all');
    this.workoutGoals.forEach(g => g.active = g.id === 'all');
    this.activeFilters = 0;
    this.filteredPrograms = [...this.allPrograms];
  }
  
  /**
   * Alterna a visibilidade do painel de filtros
   */
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}
