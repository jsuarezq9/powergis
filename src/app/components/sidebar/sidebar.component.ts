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
    buttonDespacho: this.WHITE,
  };
  expandSidebar = false;
  rotation: string;
  layerEstaciones: any;
  layerVMEstaciones: any;
  layerDespacho: any;
  layerRaster: any;
  interval: any;

  // Estilos
  stylesHidro = {
    hidroEmgesaActiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionEmgesaActiva.png', scale: 0.15, anchor: [0.5, 1]}), zIndex: 2}),
    hidroEmgesaInactiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionEmgesaInactiva.png',   scale: 0.15, anchor: [0.5, 1]}) , zIndex: 0}),
    hidroActiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionOtrosActiva.png', scale: 0.35, anchor: [0.5, 1]}), zIndex: 2}),
    hidroInactiva:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionOtrosInactiva.png',   scale: 0.35, anchor: [0.5, 1]}), zIndex: 0}),
    Default : new Style({image: new Circle({
      radius: 30,
      fill: new Fill({color: 'rgba(120, 191, 255, 0.6)'}),
      stroke: new Stroke({color: 'rgba(0, 0, 255, 0.8)',
      width: 2})}), zIndex: 0 })
  };

  selectedStylesHidro = {
    hidroSelected:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoSeleccionado.png', scale: 0.40, anchor: [0.5, 1] })}),
    Default : new Style({image: new Circle({
      radius: 20,
      fill: new Fill({color: 'rgba(120, 191, 255, 0.6)'}),
      stroke: new Stroke({color: 'rgba(0, 0, 255, 0.8)',
      width: 2})})})
  };

  stylesDespacho = {
    Emgesa:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionEmgesaActiva.png', scale: 0.15, anchor: [0.5, 1]}), zIndex: 2}),
    Otros:  new Style({
      image: new Icon({ src: './assets/icons/estaciones/IconoEstacionOtrosActiva.png', scale: 0.35, anchor: [0.5, 1]}), zIndex: 2})
  };

  legendHidro: any;
  legendRaster: any;
  legendDiv: any;
  legendExp: any;
  legendColl: any;


  constructor(private geoserver: GeoserverService,
              private interaction: ComponentsInteractionService) {}

  ngOnInit() {
    this.layerDespacho = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/xm/layers/despacho_nacional.json',
      name: 'despacho_nacional',
      edit: false,
    };
    this.layerEstaciones = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/dwh/layers/vm_estaciones_vsg.json',
      name: 'vm_estaciones_vsg',
      edit: false,
    };
    this.layerVMEstaciones = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/dwh/layers/vm_ultimo_dato_estacion.json',
      name: 'vm_ultimo_dato_estacion',
      edit: false,
    };
    this.layerRaster = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/raster/layers/PT_LAST_60D.json',
      name: 'PT_LAST_60D',
      edit: false,
    };
    this.legendDiv = document.getElementById('buttonCollapseLegendDiv');
    this.legendHidro = document.getElementById('legendModuleHidro');
    this.legendRaster = document.getElementById('rasterLegend');
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
    this.removeLegendRaster();
    this.interaction.setStationsLayer(this.layerEstaciones, this.stylesHidro, this.selectedStylesHidro);
    this.interval = setInterval(this.runLayersHidroHourly, 3600000);
    // console.log(this.legendHidro);
    this.legendHidro.style.display = 'flex';

    const legendDiv = document.getElementById('legend');
    // legendDiv.classList.toggle('legend-expanded');
    let isExpanded = false;
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < legendDiv.classList.length; index++) {
      const element = legendDiv.classList[index];
      if (element === 'legend-expanded') {
        isExpanded = true;
      }
    }
    // console.log(isExpanded);
    if (!isExpanded) {
      document.getElementById('buttonCollapseLegendDiv').style.display = 'flex';
      legendDiv.classList.add('legend-expanded');
      const legendCollapsed = document.getElementById('legendCollapsed');
      legendCollapsed.style.display = 'none';
      const legendExpanded = document.getElementById('legendExpanded');
      legendExpanded.style.display = 'block';
    }

  }

  addEstacionesPrecipitation() {
    this.removeEstaciones();
    this.addRaster(this.layerRaster);
    this.interaction.setPrecipitationLayer(this.layerVMEstaciones, false);
    this.interaction.setPrecipitationRainLayer(this.layerVMEstaciones, false);
    this.interval = setInterval(this.runLayersPrecipitationHourly, 3600000);
    // clearInterval(this.interval);
    this.legendHidro.style.display = 'none';
    this.legendRaster.style.display = 'block';
  }

  addEstacionesDespacho() {
    this.removeEstaciones();
    this.removeLegendRaster();
    this.interaction.setStationsDespacho(this.layerDespacho, this.stylesDespacho, this.selectedStylesHidro);
    // this.interval = setInterval(this.runLayersHidroHourly, 3600000);
  //   // console.log(this.legendHidro);
  //   //this.legendHidro.style.display = 'flex';

  //   //const legendDiv = document.getElementById('legend');
  //   // legendDiv.classList.toggle('legend-expanded');
  //  // let isExpanded = false;
  //   // tslint:disable-next-line:prefer-for-of
  //   for (let index = 0; index < legendDiv.classList.length; index++) {
  //     const element = legendDiv.classList[index];
  //     if (element === 'legend-expanded') {
  //       isExpanded = true;
  //     }
  //   }
  //   // console.log(isExpanded);
  //   if (!isExpanded) {
  //     document.getElementById('buttonCollapseLegendDiv').style.display = 'flex';
  //     legendDiv.classList.add('legend-expanded');
  //     const legendCollapsed = document.getElementById('legendCollapsed');
  //     legendCollapsed.style.display = 'none';
  //     const legendExpanded = document.getElementById('legendExpanded');
  //     legendExpanded.style.display = 'block';
   // }

  }

  removeEstaciones() {
    clearInterval(this.interval);
    this.interaction.setLayer(this.layerEstaciones, false, false);
    this.interaction.setLayer(this.layerVMEstaciones, false, false);
    this.interaction.setLayer(this.layerRaster, false, false);
    this.interaction.setSelectLayer(this.layerVMEstaciones, true, false);
    this.legendHidro.style.display = 'none';
  }

  removeLegendRaster = () => {
    this.legendRaster.style.display = 'none';
  }

  addRaster(raster: any) {
    this.interaction.setRaster(raster);
  }


  runLayersPrecipitationHourly = () => {
    // borrando las layers
    this.interaction.setLayer(this.layerVMEstaciones, false, false);
    this.interaction.setLayer(this.layerRaster, false, false);
    this.interaction.setSelectLayer(this.layerVMEstaciones, true, false);
    // creando las layers
    this.interaction.setRaster(this.layerRaster);
    this.interaction.setPrecipitationLayer(this.layerVMEstaciones, false);
    this.interaction.setPrecipitationRainLayer(this.layerVMEstaciones, false);
  }

  runLayersHidroHourly = () => {
    // borrando las layers
    this.interaction.setLayer(this.layerEstaciones, false, false);
    this.interaction.setSelectLayer(this.layerVMEstaciones, true, false);
    // creando las layers
    this.interaction.setStationsLayer(this.layerEstaciones, this.stylesHidro, this.selectedStylesHidro);
  }

}
