import { Component, OnInit, Input } from '@angular/core';
import { DatawarehouseService } from '../../services/datawarehouse.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
import * as moment from 'moment';

@Component({
  selector: 'app-modulehidro-timeseries',
  templateUrl: './modulehidro-timeseries.component.html',
  styleUrls: ['./modulehidro-timeseries.component.css']
})
export class ModulehidroTimeseriesComponent implements OnInit {

  selectedSensor = {};
  actualYear: number;
  firstDateYear: Date;
  data: object;
  actualData: object;
  selectorOptions = {
    buttons: [{
        step: 'hour',
        stepmode: 'backward',
        count: 3,
        label: '3H'
    }, {
        step: 'hour',
        stepmode: 'backward',
        count: 6,
        label: '6H'
    }, {
        step: 'hour',
        stepmode: 'backward',
        count: 12,
        label: '12H'
    }, {
        step: 'hour',
        stepmode: 'backward',
        count: 24,
        label: '24H'
    }, {
        step: 'day',
        stepmode: 'backward',
        count: 7,
        label: '7D'
    }, {
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1M'
    }, {
        step: 'day',
        stepmode: 'todate',
        count: 1,
        label: 'Hoy'
    }, {
        step: 'month',
        stepmode: 'todate',
        count: 1,
        label: 'Este mes'
    }, {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'Este año'
    }, {
        step: 'all',
        label: 'Todos'
    }]
  }
  public dataLines: any[];
  public layout = {};
  public debug = true;
  public useResizeHandler = true;

  constructor(
    private dwhService: DatawarehouseService,
    private interaction: ComponentsInteractionService
  ) {
    console.log("Initialize")
    this.data = {};
    this.actualYear = (new Date()).getFullYear();
    this.firstDateYear = new Date('1/1/' + this.actualYear);
    this.layout = {
      title: 'Name Test',
      xaxis: {
          tipe: 'date',
          rangeselector: this.selectorOptions,
          automargin: true,
          rangeslider: {}
      },
      yaxis: {

          fixedrange: true
      }
  };
  }

  ngOnInit() {
    const initial = moment(this.firstDateYear.valueOf()).format('YYYY-MM-DD HH:MM:SS');
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    this.interaction.timeSeriesInteraction.subscribe(sensor => {
      this.selectedSensor = sensor;
      console.log('Info en Modulehidro timeseries', sensor)
      this.renderTimeSeries(initial, today, sensor.idEstacion, sensor.idSensor);
    });
  }

  renderTimeSeries(initial, final, idStation, idSensor) {
    if (this.data[idSensor] !== undefined) {
      this.actualData = this.data[idSensor];
      this.setData(this.actualData[idSensor]);
    } else {
      this.dwhService.getSensorByStation(initial, final, idStation, idSensor).subscribe(response => {
        this.data[idSensor] = response;
        this.actualData = response;
        console.log(response)
        this.setData(response[idSensor]);
      });
    }
  }

  setData(dataSensor) {
    console.log("SENSOR DATA", this.dataLines, dataSensor);
    this.dataLines = [];
    const sensor = {
      type: 'scatter',
      mode: 'lines',
      name: 'TEST',
      // name: `${dataSensor.sensor} [ ${dataSensor.valor.split(' ', 1)[1]} ]`,
      x: dataSensor.fecha,
      y: dataSensor.total,
      line: { color: '#17BECF' }
    };
    this.dataLines.push(sensor);
  }

}
