import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingController, ToastController } from "@ionic/angular";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  standalone: false, // Definido como false para compatibilidade com Ionic
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  loginError = false;
  loginErrorMessage = "";

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]], // Remover validação de minLength para login
    });
  }

  ngOnInit() {
    // Verificar se o usuário já está logado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/tabs/home"]);
    }
  }

  /**
   * Alterna a visibilidade da password
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Verifica se um campo está inválido para mostrar feedback visual
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Limpa mensagens de erro
   */
  clearErrors() {
    this.loginError = false;
    this.loginErrorMessage = "";
  }

  /**
   * Exibe mensagem de erro específica
   */
  showError(message: string) {
    this.loginError = true;
    this.loginErrorMessage = message;
  }

  /**
   * Valida os campos do formulário
   */
  validateForm(): boolean {
    const emailControl = this.loginForm.get("email");
    const passwordControl = this.loginForm.get("password");

    // Marcar campos como touched para mostrar erros
    emailControl?.markAsTouched();
    passwordControl?.markAsTouched();

    // Verificar email
    if (!emailControl?.value || emailControl.value.trim() === "") {
      this.showError("O email é obrigatório.");
      return false;
    }

    if (emailControl.invalid) {
      this.showError("Por favor, insira um email válido.");
      return false;
    }

    // Verificar password - apenas se não está vazia
    if (!passwordControl?.value || passwordControl.value.trim() === "") {
      this.showError("A password é obrigatória.");
      return false;
    }

    // Remover validação de comprimento mínimo para login
    // O AuthService irá verificar se as credenciais estão corretas

    return true;
  }

  /**
   * Processa o login do usuário
   */
  async onLogin() {
    // Limpar erros anteriores
    this.clearErrors();

    // Validar formulário
    if (!this.validateForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: "A fazer login...",
      spinner: "crescent",
    });

    await loading.present();

    try {
      const email = this.loginForm.get("email")?.value.trim().toLowerCase();
      const password = this.loginForm.get("password")?.value;

      // Tentar fazer login através do AuthService
      this.authService.login(email, password).subscribe(async (result) => {
        await loading.dismiss();

        if (result.success) {
          // Login bem-sucedido
          const toast = await this.toastController.create({
            message: `Bem-vindo de volta!`,
            duration: 2000,
            position: "bottom",
            color: "success",
          });
          await toast.present();

          // Navegar para a página principal
          this.router.navigate(["/tabs/home"]);
        } else {
          // Erro no login
          this.showError(result.message);
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.showError("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  /**
   * Exibe toast com mensagem específica (método auxiliar)
   */
  async showToast(message: string, color: string = "danger") {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: "bottom",
      color: color,
    });
    await toast.present();
  }
}
