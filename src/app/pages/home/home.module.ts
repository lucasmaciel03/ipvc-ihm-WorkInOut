import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { HomePageRoutingModule } from "./home-routing.module";

import { HomePage } from "./home.page";

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HomePage, // Import the standalone component instead of declaring it
  ],
  declarations: [], // No declarations since HomePage is standalone
})
export class HomePageModule {
}
