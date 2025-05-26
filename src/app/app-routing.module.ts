import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "splash",
    loadChildren: () =>
      import("./splash/splash.module").then((m) => m.SplashPageModule),
  },
  {
    path: "home",
    loadChildren: () =>
      import("./home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: "start",
    loadChildren: () =>
      import("./start/start.module").then((m) => m.StartPageModule),
  },
  {
    path: "login",
    loadChildren: () =>
      import("./login/login.module").then((m) => m.LoginPageModule),
  },
  {
    path: "",
    redirectTo: "splash",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "splash",
  },
  {
    path: "create-account",
    loadChildren: () =>
      import("./create-account/create-account.module").then(
        (m) => m.CreateAccountPageModule
      ),
  },
  {
    path: "exercise-details/:id",
    loadChildren: () =>
      import("./exercise-details/exercise-details.module").then(
        (m) => m.ExerciseDetailsPageModule
      ),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'home',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
