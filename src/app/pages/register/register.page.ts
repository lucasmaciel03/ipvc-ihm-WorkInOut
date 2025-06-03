import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, RegisterForm } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false 
})
export class RegisterPage implements OnInit {
  // Definição do modo de desenvolvimento
  devMode = true; // Quando true, ignora validações para facilitar desenvolvimento
  
  currentStep = 1;
  totalSteps = 3;
  showPassword = false;
  showConfirmPassword = false;
  
  // Formulários para cada etapa
  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;
  
  // Modelo de utilizador para armazenar os dados
  userData: User = {
    name: '',
    email: '',
    password: '',
    objective: 'ficar-em-forma',
    height: 170,
    weight: 70,
    age: 25,
    gender: 'masculino'
  };
  
  // Objetivos disponíveis
  objectives = [
    { id: 'perder-peso', label: 'Perder Peso', icon: 'trending-down' },
    { id: 'ganhar-musculo', label: 'Ganhar Músculo', icon: 'trending-up' },
    { id: 'ficar-em-forma', label: 'Ficar em Forma', icon: 'fitness' }
  ];
  
  // Géneros disponíveis
  genders = [
    { id: 'masculino', label: 'Masculino' },
    { id: 'feminino', label: 'Feminino' },
    { id: 'outro', label: 'Outro' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Inicializa os formulários
    this.step1Form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
    
    this.step2Form = this.formBuilder.group({
      objective: ['ficar-em-forma', Validators.required]
    });
    
    this.step3Form = this.formBuilder.group({
      height: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
      weight: [70, [Validators.required, Validators.min(30), Validators.max(250)]],
      age: [25, [Validators.required, Validators.min(16), Validators.max(100)]],
      gender: ['masculino', Validators.required]
    });
  }

  ngOnInit() {
  }
  
  /**
   * Validador personalizado para verificar se as passwords coincidem
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  /**
   * Avança para o próximo passo do registo
   */
  nextStep() {
    // Em modo dev, avançamos independentemente da validação
    if (this.devMode) {
      if (this.currentStep === 1) {
        // Pegar os valores disponíveis mesmo que inválidos
        this.userData.name = this.step1Form.get('name')?.value || 'Dev User';
        this.userData.email = this.step1Form.get('email')?.value || 'dev@example.com';
        this.userData.password = this.step1Form.get('password')?.value || 'password';
        this.currentStep++;
      } else if (this.currentStep === 2) {
        // Pegar o objetivo selecionado ou usar o padrão
        this.userData.objective = this.step2Form.get('objective')?.value || 'ficar-em-forma';
        this.currentStep++;
      } else if (this.currentStep === 3) {
        // Pegar os dados disponíveis ou usar valores padrão
        this.userData.height = this.step3Form.get('height')?.value || 175;
        this.userData.weight = this.step3Form.get('weight')?.value || 70;
        this.userData.age = this.step3Form.get('age')?.value || 30;
        this.userData.gender = this.step3Form.get('gender')?.value || 'masculino';
        
        // Completa o registo
        this.completeRegistration();
      }
    } else {
      // Em modo produção, verificamos a validação normal
      if (this.currentStep === 1 && this.step1Form.valid) {
        // Atualiza os dados do utilizador
        this.userData.name = this.step1Form.get('name')?.value;
        this.userData.email = this.step1Form.get('email')?.value;
        this.userData.password = this.step1Form.get('password')?.value;
        this.currentStep++;
      } else if (this.currentStep === 2 && this.step2Form.valid) {
        // Atualiza o objetivo do utilizador
        this.userData.objective = this.step2Form.get('objective')?.value;
        this.currentStep++;
      } else if (this.currentStep === 3 && this.step3Form.valid) {
        // Atualiza os dados finais do utilizador
        this.userData.height = this.step3Form.get('height')?.value;
        this.userData.weight = this.step3Form.get('weight')?.value;
        this.userData.age = this.step3Form.get('age')?.value;
        this.userData.gender = this.step3Form.get('gender')?.value;
        
        // Completa o registo
        this.completeRegistration();
      }
    }
  }
  
  /**
   * Volta ao passo anterior
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  /**
   * Altera o objetivo selecionado
   */
  selectObjective(objectiveId: string) {
    this.step2Form.get('objective')?.setValue(objectiveId);
  }
  
  /**
   * Conclui o processo de registo
   */
  completeRegistration() {
    console.log('Utilizador registado:', this.userData);
    
    // Aqui seria feita a chamada à API para registo do utilizador
    // Como isto é um protótipo, vamos apenas redirecionar para a página principal
    setTimeout(() => {
      this.router.navigateByUrl('/tabs/home');
    }, 1500);
  }
  
  /**
   * Alterna a visibilidade da password
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  /**
   * Alterna a visibilidade da confirmação de password
   */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  /**
   * Navega de volta para a página anterior
   */
  goBack() {
    this.router.navigate(['/get-started']);
  }
}
