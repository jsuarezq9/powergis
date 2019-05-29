import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  date: Date;
  day: number;
  month: string;
  hour: any;
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor() {
    this.date = new Date();
    this.day = this.date.getDate();
    this.month = this.months[this.date.getMonth()];
    this.hour = this.date.toLocaleTimeString();
    setInterval(this.updateDate, 10000);
  }

  updateDate() {
    this.date = new Date();
    this.day = this.date.getDate();
    this.hour = this.date.toLocaleTimeString();
    document.getElementById('hourElement').innerHTML = this.hour;
  }

  ngOnInit() {
    document.getElementById('hourElement').innerHTML = this.hour;
  }

}
