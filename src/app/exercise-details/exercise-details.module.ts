import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ExerciseDetailsPageRoutingModule } from "./exercise-details-routing.module";

import { ExerciseDetailsPage } from "./exercise-details.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExerciseDetailsPageRoutingModule,
    ExerciseDetailsPage, // Import the standalone component
  ],
  declarations: [], // No declarations for standalone component
})
export class ExerciseDetailsPageModule {}
