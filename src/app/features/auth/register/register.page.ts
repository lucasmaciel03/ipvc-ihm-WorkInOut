import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  LoadingController,
  ToastController,
  AlertController,
} from "@ionic/angular";
import { AuthService, User } from "../../../core/services/auth.service";

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
  showSuccessModal = false;

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
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService
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

        // Etapa 3: Condição Física - Agora com campos obrigatórios
        height: [
          "",
          [Validators.required, Validators.min(100), Validators.max(250)],
        ],
        weight: [
          "",
          [Validators.required, Validators.min(30), Validators.max(300)],
        ],
        age: [
          "",
          [Validators.required, Validators.min(13), Validators.max(100)],
        ],
        gender: ["", Validators.required],
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
      event.stopPropagation();
      event.preventDefault();
    }
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna a visibilidade da confirmação de senha
   */
  toggleConfirmPasswordVisibility(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Valida apenas os campos relevantes para a etapa atual
   */
  validateCurrentStep(): boolean {
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
  }

  /**
   * Valida os campos da etapa 1 com mensagens específicas
   */
  validateStep1(): boolean {
    const nameControl = this.registerForm.get("name");
    const emailControl = this.registerForm.get("email");
    const passwordControl = this.registerForm.get("password");
    const confirmPasswordControl = this.registerForm.get("confirmPassword");

    // Marcar campos como touched para mostrar erros
    nameControl?.markAsTouched();
    emailControl?.markAsTouched();
    passwordControl?.markAsTouched();
    confirmPasswordControl?.markAsTouched();

    // Verificar campo nome
    if (!nameControl?.value || nameControl.value.trim() === "") {
      this.showSpecificError("O nome é obrigatório.");
      return false;
    }
    if (nameControl.value.trim().length < 3) {
      this.showSpecificError("O nome deve ter pelo menos 3 caracteres.");
      return false;
    }

    // Verificar campo email
    if (!emailControl?.value || emailControl.value.trim() === "") {
      this.showSpecificError("O email é obrigatório.");
      return false;
    }
    if (emailControl?.invalid) {
      this.showSpecificError("Por favor, insira um email válido.");
      return false;
    }

    // Verificar campo password
    if (!passwordControl?.value || passwordControl.value.trim() === "") {
      this.showSpecificError("A password é obrigatória.");
      return false;
    }
    if (passwordControl.value.length < 6) {
      this.showSpecificError("A password deve ter pelo menos 6 caracteres.");
      return false;
    }

    // Verificar confirmação de password
    if (
      !confirmPasswordControl?.value ||
      confirmPasswordControl.value.trim() === ""
    ) {
      this.showSpecificError("Confirme a sua password.");
      return false;
    }
    if (passwordControl?.value !== confirmPasswordControl?.value) {
      this.showSpecificError("As passwords não coincidem.");
      return false;
    }

    return true;
  }

  /**
   * Valida os campos da etapa 2 com mensagem específica
   */
  validateStep2(): boolean {
    const primaryGoalControl = this.registerForm.get("primaryGoal");

    if (!primaryGoalControl?.value) {
      this.showSpecificError("Por favor, selecione um objetivo principal.");
      return false;
    }

    return true;
  }

  /**
   * Valida os campos da etapa 3 com mensagens específicas
   */
  validateStep3(): boolean {
    const heightControl = this.registerForm.get("height");
    const weightControl = this.registerForm.get("weight");
    const ageControl = this.registerForm.get("age");
    const genderControl = this.registerForm.get("gender");

    // Verificar se pelo menos altura, peso e idade foram fornecidos
    if (!heightControl?.value || heightControl.value === "") {
      this.showSpecificError("A altura é obrigatória.");
      return false;
    }

    if (!weightControl?.value || weightControl.value === "") {
      this.showSpecificError("O peso é obrigatório.");
      return false;
    }

    if (!ageControl?.value || ageControl.value === "") {
      this.showSpecificError("A idade é obrigatória.");
      return false;
    }

    if (!genderControl?.value || genderControl.value === "") {
      this.showSpecificError("O género é obrigatório.");
      return false;
    }

    // Validar altura se fornecida
    if (
      heightControl.value &&
      (heightControl.value < 100 || heightControl.value > 250)
    ) {
      this.showSpecificError("A altura deve estar entre 100 e 250 cm.");
      return false;
    }

    // Validar peso se fornecido
    if (
      weightControl.value &&
      (weightControl.value < 30 || weightControl.value > 300)
    ) {
      this.showSpecificError("O peso deve estar entre 30 e 300 kg.");
      return false;
    }

    // Validar idade se fornecida
    if (ageControl.value && (ageControl.value < 13 || ageControl.value > 100)) {
      this.showSpecificError("A idade deve estar entre 13 e 100 anos.");
      return false;
    }

    return true;
  }

  /**
   * Exibe uma mensagem de erro específica
   */
  async showSpecificError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: "bottom",
      color: "danger",
      cssClass: "error-toast",
    });

    await toast.present();
  }

  /**
   * Processa o envio do formulário completo com validações mais específicas
   */
  async onSubmit() {
    if (!this.validateCurrentStep()) {
      return; // A mensagem de erro já foi exibida na função validate
    }

    const loading = await this.loadingController.create({
      message: "A criar conta...",
      spinner: "crescent",
    });

    await loading.present();

    try {
      // Verificar se o email já existe
      const email = this.registerForm.get("email")?.value;
      if (this.authService.emailExists(email)) {
        await loading.dismiss();

        const toast = await this.toastController.create({
          message: `O email "${email}" já está registrado. Tente fazer login ou use outro email.`,
          duration: 4000,
          position: "bottom",
          color: "warning",
        });
        await toast.present();

        // Voltar para o step 1 para o usuário corrigir o email
        this.currentStep = 1;
        return;
      }

      // Preparar dados do usuário
      const userData = {
        name: this.registerForm.get("name")?.value?.trim(),
        email: this.registerForm.get("email")?.value?.trim().toLowerCase(),
        password: this.registerForm.get("password")?.value,
        age: this.registerForm.get("age")?.value || null,
        height: this.registerForm.get("height")?.value || null,
        weight: this.registerForm.get("weight")?.value || null,
        gender: this.registerForm.get("gender")?.value || null,
        primaryGoal: this.registerForm.get("primaryGoal")?.value,
      };

      // Registrar usuário
      this.authService.register(userData).subscribe(async (result) => {
        await loading.dismiss();

        if (result.success) {
          // Mostrar modal de sucesso
          this.showSuccessModal = true;
        } else {
          // Mostrar erro específico do serviço
          const toast = await this.toastController.create({
            message: result.message,
            duration: 4000,
            position: "bottom",
            color: "danger",
          });
          await toast.present();
        }
      });
    } catch (error) {
      await loading.dismiss();

      const toast = await this.toastController.create({
        message:
          "Ocorreu um erro inesperado. Verifique os seus dados e tente novamente.",
        duration: 4000,
        position: "bottom",
        color: "danger",
      });
      await toast.present();
    }
  }

  /**
   * Fecha o modal de sucesso e navega para o login
   */
  closeSuccessModal() {
    this.showSuccessModal = false;

    // Navegar para a página de login após fechar o modal
    setTimeout(() => {
      this.router.navigate(["/auth/login"]);
    }, 300);
  }

  /**
   * Seleciona um objetivo e atualiza o formulário
   * @param goalValue O valor do objetivo selecionado
   */
  selectGoal(goalValue: string): void {
    this.registerForm.get("primaryGoal")?.setValue(goalValue);
  }
}
