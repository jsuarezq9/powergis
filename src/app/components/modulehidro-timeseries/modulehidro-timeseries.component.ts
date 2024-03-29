import { Component, OnInit, Input } from '@angular/core';
import { DatawarehouseService } from '../../services/datawarehouse.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
import * as moment from 'moment';
import { typeofExpr } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-modulehidro-timeseries',
  templateUrl: './modulehidro-timeseries.component.html',
  styleUrls: ['./modulehidro-timeseries.component.css']
})

export class ModulehidroTimeseriesComponent implements OnInit {
  datafecha: Date;
  selectedSensor: any;
  actualYear: number;
  firstDateYear: Date;
  data: object;
  actualData: object;
  fecha_inicio;
  fecha_fin;
  fi: any;
  ff: any;
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
  };
  public dataLines: any[];
  public layout = {};
  public debug = true;
  public useResizeHandler = true;

  constructor(
    private dwhService: DatawarehouseService,
    private interaction: ComponentsInteractionService
  ) {
    this.data = {};
    this.actualYear = (new Date()).getFullYear();
    this.firstDateYear = new Date('1/1/' + this.actualYear);
    this.layout = {
      title: false,
      connectgaps: false,
      autosize: true,
      // autosize: false,
      // width: 500,
      height: 300,
      margin: {
        l: 50,
        r: 50,
        b: 0,
        t: 50,
        // pad: 5
      },
      xaxis: {
          tipe: 'date',
          rangeselector: this.selectorOptions,
          automargin: true,
          rangeslider: {}
      },
      yaxis: {
          fixedrange: true,

      },
  };
  }

  ngOnInit() {
    // // console.log(this.firstDateYear);
    const initial = moment(this.firstDateYear.valueOf()).format('YYYY-MM-DD HH:mm:ss');
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    this.interaction.timeSeriesInteraction.subscribe(sensor => {
      this.selectedSensor = sensor;
      this.renderTimeSeries(initial, today, sensor.idEstacion, sensor.idSensor);
    });
  }
  onValueChangeA(value: Date): void {
    this.fecha_inicio = value;
    // console.log(this.fecha_inicio);
  }
  onValueChangeB(value: Date): void {
    this.fecha_fin = value;
    // console.log(this.fecha_fin);
  }
  renderTimeSeries(initial, final, idStation, idSensor) {
    this.formingRequest(initial, final, idStation, idSensor);
    // const existsSensor = this.data[idSensor] !== undefined ? true : false;
    // let existsDate: boolean;
    // if (existsSensor) {
    //   const dates = this.data[idSensor][idSensor].fecha;
    //   const initialDate = moment(dates[0]).format('YYYY-MM-DD HH:mm:ss');
    //   const finalDate = moment(dates[dates.length - 1]).format('YYYY-MM-DD HH:mm:ss');
    //   existsDate =  initialDate < initial && final < finalDate ? true : false;
    //   // console.log(initialDate, '>', initial, '?', final, '<', finalDate, '?', existsDate);
    //   if (existsDate) {
    //     // ARREGLO
    //     // Reemplazo en data
    //     let initialIdx: any;
    //     let finalIdx: any;
    //     for (let i = 0; i < dates.length; i++) {
    //       const a = moment(initial).format('YYYY-MM-DDTHH:mm:ss');
    //       const b = moment(final).add(i , 'days').format('YYYY-MM-DDTHH:mm:ss');
    //       initialIdx = dates.indexOf(a);
    //       finalIdx = dates.indexOf(b);
    //       // console.log('fechas', a, b);
    //       // console.log('indexes', initialIdx, finalIdx);
    //       if (initialIdx !== -1 && finalIdx !== -1) {
    //         break;
    //       }
    //     }
    //     this.data[idSensor][idSensor].fecha = this.data[idSensor][idSensor].fecha.slice(initialIdx, finalIdx + 1);
    //     this.data[idSensor][idSensor].total = this.data[idSensor][idSensor].fecha.slice(initialIdx, finalIdx + 1);
    //     this.actualData = this.data[idSensor];
    //     this.setData(this.actualData[idSensor]);
    //     // console.log('Existeeeee date', initial, initialIdx, finalIdx);
    //     // console.log(dates)
    //   } else {
    //     // CONSULTA
    //     this.formingRequest(initial, final, idStation, idSensor);
    //   }
    // } else {
    //   // CONSULTA
    //   this.formingRequest(initial, final, idStation, idSensor);
    // }
  }

  formingRequest(initial, final, idStation, idSensor) {
    this.dwhService.getSensorByStation(initial, final, idStation, idSensor).subscribe(response => {
      this.data[idSensor] = response;
      this.actualData = response;
      this.setData(response[idSensor]);
    });
  }

  setData(dataSensor) {
    this.dataLines = [];
    const sensor = {
      type: 'scatter',
      mode: 'lines',
      name: 'TEST',
      // name: `${dataSensor.sensor} [ ${dataSensor.valor.split(' ', 1)[1]} ]`,
      x: dataSensor.fecha,
      y: dataSensor.total,
      line: { color: '#17BECF'},
      autosize: true
    };
    this.dataLines.push(sensor);
  }

  refreshData(inicio: any, final: any) {
    // this.interaction.setSensor(item);
    // Warning
    if (!inicio || !final) {
      // document.getElementById(`warningText2`).style.display = 'block';
    } else {
      // document.getElementById(`warningText2`).style.display = 'none';
      // this.fi = document.getElementById('fechaInicio');
      // this.ff = document.getElementById('fechaFin');
      // console.log(inicio);
      // console.log(final);
      const today = moment().format('YYYY-MM-DD HH:mm:ss');
      // // console.log('Fechas input', inicio, final);
      // // console.log('Fechas desde getelementbyid', this.fi.value, this.ff.value);
      const a = moment(inicio).format('YYYY-MM-DD');
      const b = moment(final).format('YYYY-MM-DD 23:00:00');
      // console.log('Fechas ffff', a, b);
      // console.log('Sensor seleccionado ffff', this.selectedSensor, typeof this.selectedSensor);
      // console.log('Sensor idEstacion ffff', this.selectedSensor.idEstacion);

      this.renderTimeSeries(a, b, this.selectedSensor.idEstacion, this.selectedSensor.idSensor);
    }
  }

  keepDropdown(event: any) {
    event.stopPropagation();
  }

  appendLeadingZeroes(n) {
    if (n <= 9) {
        return '0' + n;
    }
    return n;
}
setStyle(event: any) {
  // Reiniciar estilos
  document.getElementById(`buttonPreestablecido`).classList.remove('active');
  document.getElementById(`buttonPersonalizado`).classList.remove('active');

  // Asignar estilos a botón seleccionado
  const button = document.getElementById(`${event.target.id}`);
  button.classList.add('active');
}
}
