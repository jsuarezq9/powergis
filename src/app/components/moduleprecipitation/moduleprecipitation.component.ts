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
  nameRasterActual = 'Preestablecido';
  layerEstaciones: any;
  layerVMEstaciones: any;
  isQuery = false;
  // tslint:disable-next-line:variable-name
  date_inicio;
  // tslint:disable-next-line:variable-name
  date_final;

  constructor(private interaction: ComponentsInteractionService,
              private geoservice: GeoserverService ) {
  this.getRasters();
  this.nameRasterActual = 'Preestablecido';
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
    this.nameRasterActual = 'Preestablecido';
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
      this.getRastersNames();
      this.rasters.sort((a, b) => a.title.localeCompare(b.title));
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

  getRastersNames(): void {
    this.rasters.forEach(element => {
      const rasterArray = element.name.split('_');
      let nameButton = '';
      const deltaDate = rasterArray[2];
      const deltaDateTime = deltaDate.substring( deltaDate.length - 1, deltaDate.length).toLowerCase();
      let deltaDatePeriod;

      if (deltaDate.length - 1 === 3) {
        deltaDatePeriod = Number(deltaDate.substring( 0, deltaDate.length - 1));
      } else {
        deltaDatePeriod = deltaDate.substr(0, deltaDate.length - 1);
      }

      if (deltaDateTime === 'h') {
        if (rasterArray[1] === 'LAST' && deltaDatePeriod !== '01') {
          nameButton = nameButton + `Últimas ${deltaDatePeriod} horas`;
        } else {
          nameButton = nameButton + 'Última hora';
        }
      } else if (deltaDateTime === 'd') {
        if (rasterArray[1] === 'LAST' && deltaDatePeriod !== '01') {
          nameButton = nameButton + `Últimos ${deltaDatePeriod} días`;
        } else {
          nameButton = nameButton + 'Último día';
        }
      }
      element.title = nameButton;
    });
  }

  changeRaster(rasterSeleccionado: any) {
    this.removeAllRasters();
    this.addRaster(rasterSeleccionado);
    // Cambiar estilo de selección
    this.rasters.forEach(element => {
      document.getElementById(element.name).classList.remove('active');
    });
    document.getElementById(rasterSeleccionado.name).classList.add('active');
  }

  changeNameDrop(rasterSeleccionado: any) {
    this.nameRasterActual = rasterSeleccionado.title;
  }

  removeAllRasters() {
    this.rasters.forEach(element => {
      this.interaction.setLayer(element, false, false);
    });
  }

  addRaster(raster: any) {
    this.interaction.setRaster(raster);
  }

  changeEstaciones(iniDate?: any, finDate?: any) {
    this.interaction.setLayer(this.layerVMEstaciones, false, false);
    this.interaction.setPrecipitationLayer(this.layerVMEstaciones, this.isQuery, iniDate, finDate);
    this.interaction.setRainLayer(this.layerVMEstaciones, true, false);
  }

  getDateQuery(inicio: any, final: any) {
    // Warning
    if (!inicio || !final) {
      document.getElementById(`warningText`).style.display = 'block';
    } else {
      document.getElementById(`warningText`).style.display = 'none';
      // Cambio de estaciones con booleano en true
      this.isQuery = true;
      this.changeEstaciones(inicio, final);
      console.log('query ', this.isQuery, inicio, final);
      this.isQuery = false;
    }
  }

  setStyle(event: any) {
    // Reiniciar estilos
    document.getElementById(`buttonPreestablecido`).classList.remove('active');
    document.getElementById(`buttonPersonalizado`).classList.remove('active');

    // Asignar estilos a botón seleccionado
    const button = document.getElementById(`${event.target.id}`);
    button.classList.add('active');
  }

  keepDropdown(event: any) {
    event.stopPropagation();
  }
}
