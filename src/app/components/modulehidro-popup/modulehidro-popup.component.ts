import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';
import { DatawarehouseService } from '../../services/datawarehouse.service';

import * as moment from 'moment';

@Component({
  selector: 'app-modulehidro-popup',
  templateUrl: './modulehidro-popup.component.html',
  styleUrls: ['./modulehidro-popup.component.css']
})
export class ModulehidroPopupComponent implements OnInit {

  info: any[];
  showInfo: boolean;
  stationCompany: any;
  stationName: any;
  stationId: any;
  stationState: any;
  date: string;
  popup: any;
  selectedSensor: any;

  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(private interaction: ComponentsInteractionService,
              private dwhService: DatawarehouseService) { }
    ngOnInit() {
    this.popup = document.getElementById('myPopup');
    this.stationCompany = '';
    this.stationName = '';
    this.stationId = '';
    this.stationState = '';
    this.showInfo = true;
    this.selectedSensor = {};
    // Recibir respuesta de servicio de interacción de la capa estaciones y determinar acción
    this.interaction.popupInteraction.subscribe((popup: any) => {
      if ( popup !== undefined) {
        this.initializePopup();
        this.stationCompany = popup.nombreEntidad;
        this.stationName = popup.nombreEstacion;
        this.stationId = popup.idEstacion;
        this.stationState = popup.estadoEstacion;

        // Preguntar y recibir respuesta de servicio de dwh de la estación seleccionada y determinar acción
        this.dwhService.getSensorsLastInfoByStation(this.stationId).subscribe((data: any) => {
          if (data.length > 0) {
            this.showInfo = true;
            this.info = data;
            this.date = this.info[0].fecha;
            const formatDates = this.date.valueOf().toString().split(',')[0].split('/');
            this.date = `${formatDates[0]} ${this.months[Number(formatDates[1]) - 1]}`;
          } else {
            // // console.log('NO hay datos de la estación seleccionada');
            this.showInfo = false;
            this.info = [];
            this.date = undefined;
          }
        }, (error) => {
          alert(`Error on interaction PopUp ${error.message}`);
        });
      }

    });

  }

  getBigPopup() {

    // Escondo el popup
    const popup = document.getElementById('myPopup');
    popup.classList.remove('show');

    // Muestro el popupExpanded
    const popupExpanded = document.getElementById('myPopupExpandedContainer');
    popupExpanded.style.display = 'flex';
    const popupModule = document.getElementById('moduleHidroPopup');
    popupModule.style.display = 'block';
    popupModule.classList.remove('hide');
    popupModule.classList.add('show');

  }

  closeLittlePopup() {
    this.popup.style.display = 'none';
  }

  closeBigPopup() {
    // Escondo el popupExpanded y el popupModule
    const popupExpanded = document.getElementById('myPopupExpandedContainer');
    popupExpanded.style.display = 'none';
    const popupModule = document.getElementById('moduleHidroPopup');
    popupModule.style.display = 'none';
    popupModule.classList.remove('show');
    popupModule.classList.add('hide');
  }

  changeSelection(event: any, item: any) {

    // Reinicio selección en popup y popup expanded
    const expandedItems = document.getElementsByClassName('expandeditem');
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < expandedItems.length; index++) {
      const element = expandedItems[index];
      element.classList.remove('popupbodytext-selected');
      element.classList.add('popupbodytext');
    }
    const collapsedItems = document.getElementsByClassName('collapseditem');
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < collapsedItems.length; index++) {
      const element = collapsedItems[index];
      element.classList.remove('popupbodytext-selected');
      element.classList.add('popupbodytext');
    }

    // Asigno clase selección según de dónde provenga selección (popup o popupExpanded)
    const id = event.path[1].id;
    const selection = document.getElementById(id);
    selection.classList.add('popupbodytext-selected');
    selection.classList.remove('popupbodytext');

    if (id.indexOf('expanded') >= 0) {
      const selectionCollapsed = document.getElementById(`${id.split('-', 1)[0]}`);
      selectionCollapsed.classList.add('popupbodytext-selected');
      selectionCollapsed.classList.remove('popupbodytext');
    } else {
      const selectionExpanded = document.getElementById(`${id}-expanded`);
      selectionExpanded.classList.add('popupbodytext-selected');
      selectionExpanded.classList.remove('popupbodytext');
    }

    // Guardo el sensor seleccionado
    this.selectedSensor = item;
  }

  displayDataSensor(item: any) {
    this.interaction.setSensor(item);
  }

  initializePopup() {
    // Escondo el popupExpanded y el popupModule
    this.popup.style.display = 'block';
    const popupExpanded = document.getElementById('myPopupExpandedContainer');
    popupExpanded.style.display = 'none';
    const popupModule = document.getElementById('moduleHidroPopup');
    popupModule.style.display = 'block';
    popupModule.classList.add('hide');
    // const popupModuleDespacho = document.getElementById('moduleDespachoPopup');
    // popupModuleDespacho.style.display = 'none';
    // const popupModuleDespacho = document.getElementById('moduleDespachoPopup');
    // popupModule.style.display = 'block';
    // popupModule.classList.add('hide');
    // Reinicio la selección de sensor del popup
    const rows = document.getElementsByClassName('popupbodytext-selected');
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < rows.length; index++) {
      rows[index].classList.add('popupbodytext');
      rows[index].classList.remove('popupbodytext-selected');
    }
  }


}
