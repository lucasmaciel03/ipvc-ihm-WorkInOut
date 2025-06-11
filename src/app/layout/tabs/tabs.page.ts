import { Component } from "@angular/core";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["tabs.page.scss"],
  standalone: false, // Mudado para false para usar com NgModule
})
export class TabsPage {
  constructor() {}
}
