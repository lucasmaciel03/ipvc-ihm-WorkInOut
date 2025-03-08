import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  login() {
    // TODO: Implementar autenticação
    console.log('Login:', { email: this.email, password: this.password });
  }

  goToSignup() {
    this.navCtrl.navigateForward('/signup', {
      animated: true
    });
  }

  forgotPassword() {
    // TODO: Implementar recuperação de password
    console.log('Recuperar password');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
