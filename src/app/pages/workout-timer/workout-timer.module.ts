import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkoutTimerPageRoutingModule } from './workout-timer-routing.module';

import { WorkoutTimerPage } from './workout-timer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkoutTimerPageRoutingModule
  ],
  declarations: [WorkoutTimerPage]
})
export class WorkoutTimerPageModule {}
