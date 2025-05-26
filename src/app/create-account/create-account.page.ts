import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-create-account",
  templateUrl: "./create-account.page.html",
  styleUrls: ["./create-account.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class CreateAccountPage implements OnInit {
  // Current step in the registration process
  currentStep = 1;

  // Password visibility toggles
  showPassword = false;
  showConfirmPassword = false;

  // User data object to store all form inputs
  userData = {
    // Step 1: Personal details
    name: "",
    birthdate: "",
    gender: "",

    // Step 2: Fitness goals
    fitnessLevel: "",
    goal: "",
    frequency: "",

    // Step 3: Account credentials
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  };

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  // Move to the next step of the registration process
  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  // Move to the previous step of the registration process
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Validate the current step before proceeding
  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      if (
        !this.userData.name ||
        !this.userData.birthdate ||
        !this.userData.gender
      ) {
        this.presentToast("Por favor, preencha todos os campos.");
        return false;
      }
    } else if (this.currentStep === 2) {
      if (
        !this.userData.fitnessLevel ||
        !this.userData.goal ||
        !this.userData.frequency
      ) {
        this.presentToast("Por favor, selecione todas as opções.");
        return false;
      }
    }
    return true;
  }

  // Toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Toggle confirm password visibility
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Check if user can create account (all fields filled and terms accepted)
  canCreateAccount(): boolean {
    return (
      !!this.userData.email &&
      !!this.userData.password &&
      !!this.userData.confirmPassword &&
      this.userData.password === this.userData.confirmPassword &&
      this.userData.acceptTerms
    );
  }

  // Create account and redirect to home page
  createAccount() {
    if (!this.canCreateAccount()) {
      if (this.userData.password !== this.userData.confirmPassword) {
        this.presentToast("As passwords não coincidem.");
      } else if (!this.userData.acceptTerms) {
        this.presentToast("Por favor, aceite os termos e condições.");
      } else {
        this.presentToast("Por favor, preencha todos os campos.");
      }
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Account created with data:", this.userData);

    this.presentToast("Conta criada com sucesso!", "success");

    // Navigate to home page after successful registration
    setTimeout(() => {
      this.router.navigate(["/home"]);
    }, 1000);
  }

  // Display toast messages
  async presentToast(message: string, color: string = "danger") {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: "bottom",
    });
    toast.present();
  }
}
