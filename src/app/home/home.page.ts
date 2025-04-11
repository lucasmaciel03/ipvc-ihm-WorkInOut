import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  selectedTab: string = 'treinos';

  constructor() {}

  ngOnInit() {
    // Inicializa a página com a tab 'treinos' selecionada
  }

  selectTab(tabName: string) {
    this.selectedTab = tabName;
  }
}
