import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingController, ToastController } from "@ionic/angular";

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
  loginErrorMessage =
    "Não foi possível fazer login. Por favor verifique os seus dados.";

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  ngOnInit() {
    // Reset do estado de erro ao inicializar
    this.loginError = false;

    // Adicionar um campo oculto ao formulário para controlar o estado de submissão
    if (!this.loginForm.get("_submitted")) {
      this.loginForm.addControl("_submitted", this.formBuilder.control(false));
    }
  }

  /**
   * Verifica se um campo específico é inválido após tentativa de envio
   * @param controlName Nome do controle de formulário a ser verificado
   * @returns Verdadeiro se o campo for inválido e formulário submetido
   */
  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(
      control &&
      control.invalid &&
      (control.touched || this.loginForm.get("_submitted")?.value)
    );
  }

  /**
   * Alterna a visibilidade da senha entre texto simples e oculto
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Manipula o envio do formulário de login
   * Implementa feedback visual genérico para manter a segurança
   */
  async onLogin() {
    // Marcar o formulário como submetido para ativar validações visuais
    this.loginForm.patchValue({ _submitted: true });

    // Resetar erro anterior se existir
    this.loginError = false;

    if (this.loginForm.invalid) {
      // Apenas exibe feedback genérico
      this.loginError = true;
      return;
    }

    const loading = await this.loadingController.create({
      message: "A autenticar...",
      spinner: "crescent",
      duration: 2000,
    });

    await loading.present();

    // Simula processo de login com atraso para demonstração
    setTimeout(async () => {
      await loading.dismiss();

      // TODO: Implementar autenticação real via serviço
      // Simulação de login bem-sucedido (em produção, este seria o retorno do serviço de auth)
      const loginSuccess = true;

      if (loginSuccess) {
        // Navegação para página principal após login bem-sucedido
        this.router.navigate(["/tabs/home"]);

        const toast = await this.toastController.create({
          message: `Bem-vindo de volta!`,
          duration: 2000,
          position: "bottom",
          color: "success",
        });

        await toast.present();
      } else {
        // Feedback genérico de erro - não revela se o problema foi email ou senha
        this.loginError = true;
      }
    }, 2000);
  }
}
