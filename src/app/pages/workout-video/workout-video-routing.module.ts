import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkoutVideoPage } from './workout-video.page';

const routes: Routes = [
  {
    path: '',
    component: WorkoutVideoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkoutVideoPageRoutingModule {}
