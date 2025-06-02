import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkoutVideoPageRoutingModule } from './workout-video-routing.module';

import { WorkoutVideoPage } from './workout-video.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkoutVideoPageRoutingModule
  ],
  declarations: [WorkoutVideoPage]
})
export class WorkoutVideoPageModule {}
