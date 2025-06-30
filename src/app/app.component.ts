import { Component } from "@angular/core";
import { CustomAlertService } from './shared/services/alert.service';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: false,
})
export class AppComponent {
  constructor(
    public alertService: CustomAlertService
  ) {}
}
