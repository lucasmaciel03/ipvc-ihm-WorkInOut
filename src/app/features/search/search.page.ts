import { Component, OnInit } from "@angular/core";
import { WorkoutService, WorkoutProgram } from "../../services/workout.service";
@Component({
  selector: "app-search",
  templateUrl: "./search.page.html",
  styleUrls: ["./search.page.scss"],
  standalone: false,
})
export class SearchPage implements OnInit {

  searchTerm: string = "";
  filteredPrograms: WorkoutProgram[] = [];
  allPrograms: WorkoutProgram[] = [];

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
      this.loadAllPrograms();
  }

  private loadAllPrograms() {
    this.workoutService.getProgramsByMuscleGroup('all').subscribe(programs => {
      this.allPrograms = programs;
      this.filteredPrograms = [...programs];
    });
  }

  filterPrograms() {
      const term = this.searchTerm?.toLowerCase() ?? '';

      this.filteredPrograms = this.allPrograms.filter(program => {
        const nome = program.nome_programa?.toLowerCase() ?? '';
        const descricao = program.descricao?.toLowerCase() ?? '';
        const tags = program.tags ?? [];

        return (
          nome.includes(term) ||
          descricao.includes(term) ||
          tags.some(tag => tag?.toLowerCase()?.includes(term))
        );
      });
    }

}
