import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: false 
})
export class StartPage {
  constructor(private navCtrl: NavController) {}

  getStarted() {
    this.navCtrl.navigateForward('/login');
  }

  signUp() {
    this.navCtrl.navigateForward('/signup');
  }
}