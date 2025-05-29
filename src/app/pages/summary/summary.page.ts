import { Component } from '@angular/core';

interface Session {
  date: string;
  calories: number;
  heart: number;
  bpmRest: number;
}

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
  standalone: false,
})
export class SummaryPage {
  sessions: Session[] = [
    { date: '2024-03-15', calories: 802, heart: 99, bpmRest: 18 },
    { date: '2024-03-04', calories: 755, heart: 90, bpmRest: 20 },
  ];

  showMore = false;

  toggleMore(): void {
    this.showMore = !this.showMore;
  }
}
