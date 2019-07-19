import { XmdespachoService } from './../../../services/xmdespacho.service';
import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../../services/interactions.service';
import { DatawarehouseService } from '../../../services/datawarehouse.service';

import * as moment from 'moment';


@Component({
  selector: 'app-despacho-popup',
  templateUrl: './despacho-popup.component.html',
  styleUrls: ['./despacho-popup.component.css']
})
export class DespachoPopupComponent implements OnInit {

  public dataLines: any[];
  public layout = {};
  public debug = true;
  public useResizeHandler = true;
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

  constructor( private interaction: ComponentsInteractionService, private dwhService: XmdespachoService,
               private dwhService2: DatawarehouseService) {
}

ngOnInit() {
  const today = moment().format('DD-MM-YYYY');
  // this.dwhService.getDespachoSin(today, today, 'PROELECT').subscribe(response => {
  // this.setData(response['description']);

  // });

  this.popup = document.getElementById('myPopupDespacho');
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

      this.dwhService.getDespachoSin(today, today, 'PROELECT').subscribe(response => {
        this.setData(response['description']);

        });
    }

  });
}

setData(dataSensor) {
  this.dataLines = [];
  const x = [];
  const y = [];
  dataSensor.forEach(element => {
    x.push(element.hora);
    y.push(element.mw);
  });
  const sensor = {
    type: 'bar',
    // mode: 'lines',
    name: 'Estacion',
    x,
    y,
    marker: {
      color: 'rgb(142,124,195)'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    line: { color: '#17BECF'},
    autosize: true
  };
  this.dataLines.push(sensor);
}

closeBigPopup() {
  // Escondo el popupExpanded y el popupModule
  const popupExpanded = document.getElementById('myPopupDespacho');
  popupExpanded.style.display = 'none';
  const popupModule = document.getElementById('moduleHidroPopup');
  popupModule.style.display = 'none';
}

initializePopup() {
  // Escondo el popupExpanded y el popupModule
  const popupExpanded = document.getElementById('myPopupDespacho');
  popupExpanded.style.display = 'block';
  const popupModule = document.getElementById('moduleHidroPopup');
  popupModule.style.display = 'block';
}
}
