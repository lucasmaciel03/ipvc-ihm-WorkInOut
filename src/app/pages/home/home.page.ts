import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) { }

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
}
