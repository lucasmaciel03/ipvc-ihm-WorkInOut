import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface CustomAlertButton {
  text: string;
  role?: 'cancel' | 'destructive' | 'confirm';
  cssClass?: string;
  handler?: () => void;
}

export interface CustomAlertOptions {
  header: string;
  subHeader?: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttons: CustomAlertButton[];
  cssClass?: string;
}

@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CustomAlertComponent {
  @Input() isOpen = false;
  @Input() options: CustomAlertOptions | null = null;
  @Output() dismiss = new EventEmitter<void>();

  onBackdropClick() {
    this.dismiss.emit();
  }

  onButtonClick(button: CustomAlertButton) {
    if (button.handler) {
      button.handler();
    }
    this.dismiss.emit();
  }
}
