import { XmdespachoService } from './../../../services/xmdespacho.service';
import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../../services/interactions.service';

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
  plantCompany: any;
  plantType: any;
  plantId: any;
  stationState: any;
  date: string;
  popup: any;
  popupExpanded: any;
  selectedSensor: any;
  today: any;
  technology: any;

  constructor( private interaction: ComponentsInteractionService, private dwhService: XmdespachoService) {
    this.layout = {
      title: false,
      connectgaps: true,
      autosize: true,
      // autosize: false,
      // width: 500,
      // height: 400,
      xaxis: {
        title: 'Hora',
      },
      yaxis: {
        title: 'mw',
      }
    };
}

ngOnInit() {
  const popupModuleHidro = document.getElementById('moduleHidroPopup');
  popupModuleHidro.style.display = 'none';

  this.today = moment().format('DD-MM-YYYY');
  // this.dwhService.getDespachoSin(today, today, 'PROELECT').subscribe(response => {
  // this.setData(response['description']);

  // });
  this.popupExpanded = document.getElementById('myPopupDespacho');
  // this.popup = document.getElementById('myPopupDespacho');
  this.plantCompany = '';
  this.plantType = '';
  this.plantId = '';
  this.stationState = '';
  this.showInfo = true;
  this.selectedSensor = {};

  // Recibir respuesta de servicio de interaccion de las plantas
  this.interaction.popupDespachoInteraction.subscribe((popup: any) => {
    if ( popup !== undefined) {
      this.initializePopup();
      this.plantCompany = popup.nombreAge;
      this.plantType = popup.tipoGener;
      this.plantId = popup.idDedec;
      this.stationState = popup.estadoEstacion;
      this.dwhService.getDespachoSin(this.plantId).subscribe(response => {
        // tslint:disable-next-line:no-string-literal
        // // console.log(response);
        this.setData(response);
        });
    }

  });
}

// Estoy agregando los datos de las gráfica y sus estilos
setData(dataSensor) {
  this.dataLines = [];
  const x = [];
  const y = [];
  dataSensor.forEach(element => {
    x.push(element.hora);
    y.push(element.valores);
  });
  const sensor = {
    type: 'bar',
    // mode: 'lines',
    name: 'Estacion',
    x,
    y,
    marker: {
      color: '#00A775'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    line: { color: '#17BECF'},
    autosize: true,
  };
  this.dataLines.push(sensor);
}

// se cierra el popup
closeBigPopup() {


  // const popupExpanded = document.getElementById('myPopupDespacho');
  this.popupExpanded.classList.remove('show');
  this.popupExpanded.classList.add('hide');
  this.popupExpanded.style.display = 'none';
  const popupModule = document.getElementById('moduleDespachoPopup');
  popupModule.style.display = 'none';
}

// Se inicializa el popup
initializePopup() {
  // this.popupExpanded = document.getElementById('myPopupDespacho');
  this.popupExpanded.style.display = 'block';
  this.popupExpanded.classList.remove('hide');
  const popupModule = document.getElementById('moduleDespachoPopup');
  popupModule.style.display = 'block';
  popupModule.classList.remove('show');
  popupModule.classList.add('hide');
}

}
