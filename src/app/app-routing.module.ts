import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'workout-video',
    loadChildren: () => import('./pages/workout-video/workout-video.module').then( m => m.WorkoutVideoPageModule)
  },
  {
    path: 'summary',
    loadChildren: () => import('./pages/summary/summary.module').then( m => m.SummaryPageModule)
  },  {
    path: 'workout-timer',
    loadChildren: () => import('./pages/workout-timer/workout-timer.module').then( m => m.WorkoutTimerPageModule)
  },
  {
    path: 'workout-summary',
    loadChildren: () => import('./pages/workout-summary/workout-summary.module').then( m => m.WorkoutSummaryPageModule)
  },

 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
