import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';

import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  layerRaster: any;

  // Estilos
  stylesHidro = {
    hidroEmgesaActiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionEmgesaActiva.png', scale: 0.20, anchor: [0.5, 1] })}),
    hidroEmgesaInactiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionEmgesaInactiva.png',   scale: 0.20, anchor: [0.5, 1] })}),
    hidroActiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionOtrosActiva.png', scale: 0.45, anchor: [0.5, 1] })}),
    hidroInactiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionOtrosInactiva.png',   scale: 0.45, anchor: [0.5, 1] })}),
    Default : new Style({image: new Circle({
      radius: 30,
      fill: new Fill({color: 'rgba(120, 191, 255, 0.6)'}),
      stroke: new Stroke({color: 'rgba(0, 0, 255, 0.8)',
      width: 2})})})
  };

  selectedStylesHidro = {
    hidroSelected:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoSeleccionado.png', scale: 0.45, anchor: [0.5, 1] })}),
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
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/dwh/layers/vm_estaciones_vsg.json',
      name: 'vm_estaciones_vsg',
      edit: false,
    };
    this.layerRaster = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/raster/layers/PT_LAST_60D.json',
      name: 'PT_LAST_60D',
      edit: false,
    };
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

  addEstacionesHidro() {
    this.removeEstaciones();
    this.interaction.setStationsLayer(this.layerEstaciones, this.stylesHidro, this.selectedStylesHidro);
  }

  addEstacionesPrecipitation() {
    this.removeEstaciones();
    this.addRaster(this.layerRaster);
    this.interaction.setPrecipitationLayer(this.layerEstaciones, this.stylesHidro, this.selectedStylesHidro);
    // arreglar ESTACIONES: consulta al servicio)
  }

  removeEstaciones() {
    this.interaction.setLayer(this.layerEstaciones, false, false);
  }

  addRaster(raster: any) {
    this.interaction.setRaster(raster);
  }

}
