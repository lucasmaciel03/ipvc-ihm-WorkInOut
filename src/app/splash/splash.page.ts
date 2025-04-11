import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false
})
export class SplashPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Redirecionar para a página inicial após 3 segundos
    // Usar replaceUrl: true para substituir a splash screen no histórico de navegação
    // Isso evita que o utilizador volte para a splash screen ao clicar no botão de voltar
    setTimeout(() => {
      this.router.navigateByUrl('/start', { replaceUrl: true });
    }, 3000);
  }

}
