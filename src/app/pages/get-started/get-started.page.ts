import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.page.html',
  styleUrls: ['./get-started.page.scss'],
  standalone: false,
})
export class GetStartedPage implements OnInit {
  animationsLoaded = false;

  constructor(
    private router: Router,
    private animationCtrl: AnimationController
  ) { }

  ngOnInit() {
    // Ativar animações após um pequeno delay para garantir que a página está renderizada
    setTimeout(() => {
      this.animationsLoaded = true;
    }, 100);
  }

  /**
   * Navega para a página de login
   */
  goToTabs() {
    this.router.navigateByUrl('/login');
  }

  /**
   * Navega para a página de login
   */
  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  /**
   * Navega para a página de registo
   * Nota: Esta funcionalidade precisa ser implementada no futuro
   */
  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}
