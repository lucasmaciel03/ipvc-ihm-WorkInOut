import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { WorkoutVideoPage } from '../workout-video/workout-video.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})

export class HomePage implements OnInit {
  homeData:any;
  selectedCategory = 'All Type';
;
  constructor(private http: HttpClient, private modalCtrl:ModalController) { }

  ngOnInit() {
    this.http.get('assets/data/home-data.json').subscribe(data => {
      this.homeData = data;
    });
  }

  filteredPrograms() {
    if (!this.homeData?.programs) return [];
    if (this.selectedCategory === 'All Type') return this.homeData.programs;
    return this.homeData.programs.filter((p:any) => p.type === this.selectedCategory);
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  async openWorkout(program:any){
    const modal = await this.modalCtrl.create({
      component: WorkoutVideoPage,
      componentProps:{program},
      cssClass:'slide-in-modal',
      showBackdrop: true,
    });

    await modal.present();
  }
}
