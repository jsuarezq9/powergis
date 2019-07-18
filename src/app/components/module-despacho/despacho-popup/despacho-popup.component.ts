import { XmdespachoService } from './../../../services/xmdespacho.service';
import { Component, OnInit } from '@angular/core';
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

  constructor( private dwhService: XmdespachoService) {
}

ngOnInit() {
  const today = moment().format('DD-MM-YYYY');
  this.dwhService.getDespachoSin(today, today, 'PROELECT').subscribe(response => {
  this.setData(response['description']);

  });
}

setData(dataSensor) {
  this.dataLines = [];
  let x = [];
  let y = [];
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
    line: { color: '#17BECF'},
    autosize: true
  };
  this.dataLines.push(sensor);
}
}
