import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingController, ToastController } from "@ionic/angular";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  currentStep = 1;

  // Certifique-se de que estas propriedades estão definidas
  showPassword = false;
  showConfirmPassword = false;

  // Lista de objetivos específicos para a etapa 2
  specificGoals = [
    { value: "core_strength", label: "Fortalecer o Core" },
    { value: "flexibility", label: "Melhorar Flexibilidade" },
    { value: "cardio", label: "Melhorar Capacidade Cardiovascular" },
    { value: "strength", label: "Aumentar Força" },
    { value: "endurance", label: "Aumentar Resistência" },
    { value: "posture", label: "Melhorar Postura" },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    // Inicializar o formulário com validações para cada etapa
    this.registerForm = this.formBuilder.group(
      {
        // Etapa 1: Dados Pessoais
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],

        // Etapa 2: Objetivos
        primaryGoal: ["", Validators.required],
        specificGoals: this.formBuilder.array([]),

        // Etapa 3: Condição Física - Atualizado conforme imagem
        height: ["", [Validators.min(100), Validators.max(250)]],
        weight: ["", [Validators.min(30), Validators.max(300)]],
        age: ["", [Validators.min(13), Validators.max(100)]],
        gender: [""],
        // Remover os campos antigos que não estão mais sendo utilizados
        // fitnessLevel: [''],
        // workoutFrequency: [''],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit() {
    // Código de inicialização se necessário
  }

  /**
   * Verifica se as senhas coincidem
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Avança para a próxima etapa se a atual for válida
   */
  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    } else {
      this.showStepValidationError();
    }
  }

  /**
   * Retorna à etapa anterior
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Navega diretamente para uma etapa específica
   * (só permite voltar, não pular etapas para frente)
   */
  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  /**
   * Alterna a visibilidade da senha
   */
  togglePasswordVisibility(event?: Event) {
    if (event) {
      event.stopPropagation(); // Impedir que o evento se propague para o input
      event.preventDefault(); // Impedir comportamento padrão
    }
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna a visibilidade da confirmação de senha
   */
  toggleConfirmPasswordVisibility(event?: Event) {
    if (event) {
      event.stopPropagation(); // Impedir que o evento se propague para o input
      event.preventDefault(); // Impedir comportamento padrão
    }
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Valida apenas os campos relevantes para a etapa atual
   * Versão simplificada para desenvolvimento
   */
  validateCurrentStep(): boolean {
    // Durante desenvolvimento, sempre retornar true para facilitar testes
    return true;

    // Código de validação original (comentado para desenvolvimento)
    /*
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      default:
        return false;
    }
    */
  }

  /**
   * Valida os campos da etapa 1
   * Versão simplificada para desenvolvimento
   */
  validateStep1(): boolean {
    // Simplificado para desenvolvimento - retorna sempre true
    return true;

    // Código original comentado
    /*
    const nameControl = this.registerForm.get("name");
    const emailControl = this.registerForm.get("email");
    const passwordControl = this.registerForm.get("password");
    const confirmPasswordControl = this.registerForm.get("confirmPassword");

    // Marcar campos como touched para mostrar erros
    nameControl?.markAsTouched();
    emailControl?.markAsTouched();
    passwordControl?.markAsTouched();
    confirmPasswordControl?.markAsTouched();

    // Verificar senhas iguais
    if (passwordControl?.value !== confirmPasswordControl?.value) {
      return false;
    }

    // Usar operador de coalescência nula para garantir valor booleano
    return (
      (nameControl?.valid ?? false) &&
      (emailControl?.valid ?? false) &&
      (passwordControl?.valid ?? false) &&
      (confirmPasswordControl?.valid ?? false)
    );
    */
  }

  /**
   * Valida os campos da etapa 2
   * Versão simplificada para desenvolvimento
   */
  validateStep2(): boolean {
    // Simplificado para desenvolvimento
    return true;

    // Código original comentado
    /*
    const primaryGoalControl = this.registerForm.get("primaryGoal");
    primaryGoalControl?.markAsTouched();

    // Usar operador de coalescência nula para garantir valor booleano
    return primaryGoalControl?.valid ?? false;
    */
  }

  /**
   * Valida os campos da etapa 3
   */
  validateStep3(): boolean {
    // A etapa 3 tem campos opcionais, então sempre retorna true
    // Podemos adicionar validações específicas se necessário
    return true;
  }

  /**
   * Exibe mensagem de erro para validação da etapa
   */
  async showStepValidationError() {
    let errorMessage = "";

    switch (this.currentStep) {
      case 1:
        errorMessage =
          "Por favor, preencha todos os dados pessoais corretamente.";
        break;
      case 2:
        errorMessage = "Por favor, selecione pelo menos um objetivo principal.";
        break;
      case 3:
        errorMessage =
          "Por favor, preencha os dados de condição física corretamente.";
        break;
    }

    const toast = await this.toastController.create({
      message: errorMessage,
      duration: 2000,
      position: "bottom",
      color: "danger",
    });

    await toast.present();
  }

  /**
   * Processa o envio do formulário completo
   * Versão simplificada para desenvolvimento
   */
  async onSubmit() {
    // Para desenvolvimento, pular validações
    const loading = await this.loadingController.create({
      message: "A criar conta...",
      spinner: "crescent",
      duration: 1000, // Reduzido para desenvolvimento
    });

    await loading.present();

    // Simulação rápida para desenvolvimento
    setTimeout(async () => {
      await loading.dismiss();

      const toast = await this.toastController.create({
        message: "Conta criada com sucesso!",
        duration: 1000,
        position: "bottom",
        color: "success",
      });

      await toast.present();

      // Navegar para a tela principal
      this.router.navigate(["/tabs/home"]);
    }, 1000); // Reduzido para desenvolvimento
  }

  /**
   * Seleciona um objetivo e atualiza o formulário
   * @param goalValue O valor do objetivo selecionado
   */
  selectGoal(goalValue: string): void {
    this.registerForm.get("primaryGoal")?.setValue(goalValue);
  }
}
