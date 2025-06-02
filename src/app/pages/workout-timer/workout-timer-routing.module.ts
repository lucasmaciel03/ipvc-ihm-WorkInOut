import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkoutTimerPage } from './workout-timer.page';

const routes: Routes = [
  {
    path: '',
    component: WorkoutTimerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkoutTimerPageRoutingModule {}
