import { Component } from '@angular/core';
import { latLng, tileLayer } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  module1 = false;
  module2 = false;
  constructor() {}

  changeState(show: any): void {
    if (show === 'bases') {
      this.module1 = !this.module1;
    } else if (show === 'tems') {
      this.module2 = !this.module2;
    }
    if (this.module1 && !this.module2) {
      document.getElementById('module2').style.width = '0%';
      document.getElementById('module1').style.width = '33%';
    } else if (this.module2 && !this.module1) {
      document.getElementById('module1').style.width = '0%';
      document.getElementById('module2').style.width = '33%';
    } else if (this.module2 && this.module1) {
      document.getElementById('module1').style.width = '33%';
      document.getElementById('module2').style.width = '33%';
    } else if (!this.module2 && !this.module1) {
      document.getElementById('module1').style.width = '0%';
      document.getElementById('module2').style.width = '0%';
    }
  }

}
