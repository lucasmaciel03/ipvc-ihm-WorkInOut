import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  constructor(private router: Router) {}

  onLogin() {
    // Por enquanto, apenas redireciona para a aplicação sem verificação
    this.router.navigate(['/app/home']);
  }
}
