import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateAccountPageRoutingModule } from './create-account-routing.module';

import { CreateAccountPage } from './create-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateAccountPageRoutingModule,
    CreateAccountPage // Import the standalone component instead of declaring it
  ],
  // Remove the declarations array or remove CreateAccountPage from it
  declarations: []
})
export class CreateAccountPageModule {}
