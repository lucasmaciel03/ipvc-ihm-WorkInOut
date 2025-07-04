import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { StatisticsPage } from "./statistics.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: "", component: StatisticsPage }]),
    StatisticsPage // Importar o componente standalone em vez de declará-lo
  ],
  // Remover declarations já que o componente é standalone
})
export class StatisticsPageModule {}
