import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Output() activeModule = new EventEmitter();

  layerList: any[];
  showBlue = true;
  collapse = false;
  WHITE = 'white';
  BLUE = 'blue';
  image = {
    buttonBases: this.WHITE,
    buttonHidrology: this.WHITE,
    buttonPrecipitation: this.WHITE,
  };
  collapseSidemenu = false;
  rotation: string;
  
  constructor(private geoserver: GeoserverService) {}

  ngOnInit() { }

  collapseAll() {
    const modules = document.getElementsByClassName('moduleFloat');
// tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < modules.length; index++) {
      const element = modules[index];
      element.classList.remove('show');
    }
  }

  rotateIcon() {
  }

  borderActive(event) {
    const modules = document.getElementsByClassName('activeButton');
    const buttons = document.getElementsByClassName('modulesButton');
    // Elimino todos los primary borders
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < buttons.length; index++) {
      const element = buttons[index];
      element.classList.remove('btn-outline-primary');
      element.classList.remove('bg-personalized');
      this.image[element.id] = this.WHITE;
    }
    // Se activan bordes al activo
// tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < modules.length; index++) {
      const element = modules[index];
      element.classList.add('btn-outline-primary');
      element.classList.add('bg-personalized');
      this.image[element.id] = this.BLUE;
    }
    // Se reinicia el activeButton
// tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < buttons.length; index++) {
      const element = buttons[index];
      element.classList.remove('activeButton');
    }
    this.activeModule.emit(event.target.offsetParent.id);
  }

}
