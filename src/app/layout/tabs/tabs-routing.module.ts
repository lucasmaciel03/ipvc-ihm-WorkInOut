import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "",
    component: TabsPage,
    children: [
      {
        path: "home",
        loadChildren: () =>
          import("../../features/home/home.module").then(
            (m) => m.HomePageModule
          ),
      },
      {
        path: "statistics",
        loadChildren: () =>
          import("../../features/statistics/statistics.module").then(
            (m) => m.StatisticsPageModule
          ),
      },
      {
        path: "search",
        loadChildren: () =>
          import("../../features/search/search.module").then(
            (m) => m.SearchPageModule
          ),
      },
      {
        path: "saved",
        loadChildren: () =>
          import("../../features/saved/saved.module").then(
            (m) => m.SavedPageModule
          ),
      },
      {
        path: "profile",
        loadChildren: () =>
          import("../../features/profile/profile.module").then(
            (m) => m.ProfilePageModule
          ),
      },
      {
        path: "",
        redirectTo: "/tabs/home",
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
