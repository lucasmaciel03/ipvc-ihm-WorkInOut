import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { WelcomePage } from './welcome.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: WelcomePage
      }
    ])
  ],
  declarations: [WelcomePage]
})
export class WelcomePageModule {}
