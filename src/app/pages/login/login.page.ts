import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  animationsLoaded = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Ativar animações após um pequeno delay para garantir que a página está renderizada
    setTimeout(() => {
      this.animationsLoaded = true;
    }, 100);
  }

  /**
   * Alterna a visibilidade da password
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Processa o formulário de login
   */
  login() {
    if (this.loginForm.valid) {
      // Aqui seria implementada a lógica de autenticação real
      console.log('Login com:', this.loginForm.value);
      
      // Por enquanto, apenas navega para a página principal
      this.router.navigateByUrl('/tabs/home');
    }
  }

  /**
   * Navega para a página de recuperação de password
   */
  forgotPassword() {
    // Implementar funcionalidade de recuperação de password
    console.log('Recuperar password');
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }
  
  /**
   * Volta para a página inicial
   */
  goBack() {
    this.router.navigateByUrl('/get-started');
  }
}
