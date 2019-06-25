import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';
import { GeoserverService } from '../../services/geoserver.service';

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
  rasters = [];
  layerEstaciones: any;
  layerVMEstaciones: any;

  constructor(private interaction: ComponentsInteractionService,
              private geoservice: GeoserverService ) {
  this.getRasters();
  }

  ngOnInit() {
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

  getRasters() {
    const source = this.geoservice.RASTERS;
    this.geoservice.getLayers(source).subscribe(async (rasters: any) => {
      this.concatLayers(rasters);
    }, (error) => {
      this.handleError(source, error);
    });
  }

  handleError(type, error) {
    alert(`Something went wrong while layer's request (${type}) on modulebase: ${error.message}`);
  }

  concatLayers(layer: any[]): void {
    this.rasters = this.rasters.length === 0 && layer !== undefined ? layer : this.rasters.concat(layer);
  }

  changeRaster(rasterSeleccionado: any) {
    console.log('rasterSeleccionado', rasterSeleccionado);
    this.removeAllRasters();
    this.addRaster(rasterSeleccionado);
  }

  removeAllRasters() {
    this.rasters.forEach(element => {
      this.interaction.setLayer(element, false, false);
    });
  }

  addRaster(raster: any) {
    this.interaction.setRaster(raster);
  }

  changeEstaciones() {
    this.interaction.setLayer(this.layerVMEstaciones, false, false);
    this.interaction.setPrecipitationLayer(this.layerVMEstaciones);
  }

  // getAggregatedData(initialDate: any, finalDate: any) {
  //   console.log('getAggregatedData', initialDate, initialDate.typeOf(), finalDate);
  // }
}
