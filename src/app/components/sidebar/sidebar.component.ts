import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';

import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';

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
  expandSidebar = false;
  rotation: string;
  layerEstaciones: any;
  public a;

  // Estilos
  stylesHidro = {
    hidroEmgesaActiva:  new Style({
      image: new Icon({ src: '../../../assets/icons/estaciones/IconoEstacionEmgesaActiva.png', scale: 0.25, anchor: [0.5, 1] })}),
    hidroEmgesaInactiva:  new Style({
      image: new Icon({ src: '../../../assets/icons/estaciones/IconoEstacionEmgesaInactiva.png',   scale: 0.25, anchor: [0.5, 1] })}),
    hidroActiva:  new Style({
      image: new Icon({ src: '../../../assets/icons/estaciones/IconoEstacionOtrosActiva.png', scale: 0.55, anchor: [0.5, 1] })}),
    hidroInactiva:  new Style({
      image: new Icon({ src: '../../../assets/icons/estaciones/IconoEstacionOtrosInactiva.png',   scale: 0.55, anchor: [0.5, 1] })}),
    Default : new Style({image: new Circle({
      radius: 30,
      fill: new Fill({color: 'rgba(120, 191, 255, 0.6)'}),
      stroke: new Stroke({color: 'rgba(0, 0, 255, 0.8)',
      width: 2})})})
  };

  selectedStylesHidro = {
    hidroSelected:  new Style({
      image: new Icon({ src: '../../../assets/icons/estaciones/IconoSeleccionado.png', scale: 0.75, anchor: [0.5, 1] })}),
    Default : new Style({image: new Circle({
      radius: 20,
      fill: new Fill({color: 'rgba(120, 191, 255, 0.6)'}),
      stroke: new Stroke({color: 'rgba(0, 0, 255, 0.8)',
      width: 2})})})
  };

  // stylesPrecipitation = {
  //   hidroEmgesaActiva:  new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaEmgesa.png',  scale: 0.25 })}),
  //   hidroEmgesaInactiva:  new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaEmgesaInactiva.png',   scale: 0.25 })}),
  //   hidroActiva:  new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaInactiva.png',   scale: 0.25 })}),
  //   hidroInactiva:  new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaOtros.png',   scale: 0.25 })}),
  //   Default : new Style({image: new Circle({radius: 4, fill: new Fill({color: 'rgba(120, 191, 255, 0.6)', }),
  //    stroke: new Stroke({color: 'rgba(0, 0, 255, 0.8)', width: 2})})})
  // };


  constructor(private geoserver: GeoserverService,
              private interaction: ComponentsInteractionService) {}

  ngOnInit() {
    this.layerEstaciones = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/dwh/layers/vm_ultimo_dato_estacion.json',
      name: 'vm_ultimo_dato_estacion',
      edit: false
    };
    // setTimeout(() => {
    //   console.log('Me inicialicé');
    //   this.addEstacionesHidro();
    //   console.log('Me inicialicé');
    // }, 1000);
  }

  collapseAll(event: any) {
    const modules = document.getElementsByClassName('moduleFloat');
// tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < modules.length; index++) {
      const element = modules[index];
      element.classList.remove('show');
    }
    this.activeModule.emit(event.target.id);
  }

  rotateIcon() {
    this.expandSidebar = !this.expandSidebar;
    this.rotation = this.expandSidebar ? 'rotate-90' : 'rotate-0';
    const icon = document.getElementById('iconExpandSidebar');
    icon.classList.toggle(this.rotation);
  }

  borderActive(event: any) {
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

  public addEstacionesHidro() {
    this.removeEstaciones();
    this.interaction.setStationsLayer(this.layerEstaciones, this.stylesHidro, this.selectedStylesHidro);
  }

  addEstacionesPrecipitation() {
    this.removeEstaciones();
    this.interaction.setStationsLayer(this.layerEstaciones, this.stylesHidro, this.selectedStylesHidro);
  }

  removeEstaciones() {
    this.interaction.setLayer(this.layerEstaciones, false, false);
  }

}
