import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadChildren: () =>
      import("../home/home.module").then((m) => m.HomePageModule),
  },
  // Adicione outras tabs conforme necessário
];

@NgModule({
  declarations: [],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
})
export class TabsPageModule {}
