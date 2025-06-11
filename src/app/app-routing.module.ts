import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "auth/welcome",
    pathMatch: "full",
  },
  {
    path: "auth",
    children: [
      {
        path: "",
        redirectTo: "welcome",
        pathMatch: "full",
      },
      {
        path: "welcome",
        loadChildren: () =>
          import("./features/auth/welcome/welcome.module").then(
            (m) => m.WelcomePageModule
          ),
      },
      {
        path: "login",
        loadChildren: () =>
          import("./features/auth/login/login.module").then(
            (m) => m.LoginPageModule
          ),
      },
      {
        path: "register",
        loadChildren: () =>
          import("./features/auth/register/register.module").then(
            (m) => m.RegisterPageModule
          ),
      },
    ],
  },
  {
    path: "tabs",
    loadChildren: () =>
      import("./layout/tabs/tabs.module").then((m) => m.TabsPageModule),
  },
  {
    path: "**",
    redirectTo: "auth/welcome",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
