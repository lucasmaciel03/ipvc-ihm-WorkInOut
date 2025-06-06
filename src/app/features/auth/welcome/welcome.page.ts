import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit, OnDestroy {
  currentImageIndex = 0;
  images = [
    'assets/images/workout-bg.jpg',
    'assets/images/workout-bg2.jpg',
    'assets/images/workout-bg3.jpg'
  ];
  private intervalId: any;

  constructor() {}

  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startSlideshow() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 5000); // Muda a cada 5 segundos
  }
}
