import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfilePage } from './profile.page';
import { GoalSelectionModalComponent } from '../../components/goal-selection-modal/goal-selection-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: ProfilePage }]),
    GoalSelectionModalComponent
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
