import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';

@Component({
  selector: 'app-moduleprecipitation',
  templateUrl: './moduleprecipitation.component.html',
  styleUrls: ['./moduleprecipitation.component.css']
})
export class ModuleprecipitationComponent implements OnInit {


  coordinatesColombia = [-74, 4];
  coordinatesEmgesa = [-76, 3.5];
  coordinatesQuimbo = [-76, 3.5];
  coordinatesBetania = [-76, 3.5];
  coordinatesRioBogota = [-76, 3.5];
  coordinatesGuavio = [-76, 3.5];
  zoomColombia = 6;
  zoomEmgesa = 8;
  zoomQuimbo = 10;
  zoomBetania = 10;
  zoomRioBogota = 10;
  zoomGuavio = 10;

  constructor(private interaction: ComponentsInteractionService) { }

  ngOnInit() {
  }

  viewColombia() {
    this.removeActive();
    document.getElementById('viewColombia').classList.add('active');
    this.interaction.setView(this.coordinatesColombia, this.zoomColombia);
  }
  viewEmgesa() {
    this.removeActive();
    document.getElementById('viewEmgesa').classList.add('active');
    this.interaction.setView(this.coordinatesEmgesa, this.zoomEmgesa);
  }
  viewQuimbo() {
    this.removeActive();
    document.getElementById('viewQuimbo').classList.add('active');
    this.interaction.setView(this.coordinatesQuimbo, this.zoomQuimbo);
  }
  viewBetania() {
    this.removeActive();
    document.getElementById('viewBetania').classList.add('active');
    this.interaction.setView(this.coordinatesBetania, this.zoomBetania);
  }
  viewRioBogota() {
    this.removeActive();
    document.getElementById('viewRioBogota').classList.add('active');
    this.interaction.setView(this.coordinatesRioBogota, this.zoomRioBogota);
  }
  viewGuavio() {
    this.removeActive();
    document.getElementById('viewGuavio').classList.add('active');
    this.interaction.setView(this.coordinatesGuavio, this.zoomGuavio);
  }

  removeActive() {
    const array = document.getElementsByClassName('dropdown-item pointer active');
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < array.length; index++ ) {
      const element = array[index];
      element.classList.remove('active');
    }
  }


}
