import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { WgerService } from '../../services/wger.service';

@Component({
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  styleUrls: ['./language-toggle.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class LanguageToggleComponent implements OnInit {
  currentLanguage = 'pt-PT';
  
  languages = [
    { code: 'pt-PT', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' }
  ];

  constructor(private wgerService: WgerService) { }

  ngOnInit() {
    // Initialize the service language on component init
    this.wgerService.setLanguage(this.currentLanguage);
  }

  changeLanguage() {
    this.wgerService.setLanguage(this.currentLanguage);
    // Emit an event or use a service to notify other components to refresh their data
    window.location.reload(); // Simple but effective approach for demonstration
  }
}
