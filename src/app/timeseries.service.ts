import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { map} from 'rxjs/operators';
import { observable, Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZ2VzdG9yX2ludGVybm8iLCJlbWFpbCI6ImFuZHJlcy52ZWxhc2NvQGVuZWwuY29tIiwiZXhwIjoxNTc3MTQ1NjAwfQ.57g7-Xu2R8OBWHODxHsQ9y3twsICBPg2uf7-oc1twT0'
  })
};


@Injectable({
  providedIn: 'root'
})
export class TimeSeriesService {

  constructor(private _http: HttpClient) { }

  rawData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion +
    '&fecha_hora=gte.' +
    fechaIncio + '&fecha_hora=lte.' +
    fechaFin + '&id_sensor=eq.' +
    sensor;
    return this._http.get<any>(urlBase + args, httpOptions)
    .map(res => res) ;
  }

  hourlyData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion + '&fecha_hora=gte.' + fechaIncio + '&fecha_hora=lte.' + fechaFin;
    return this._http.get<any>(urlBase + args, httpOptions)
    .map(res => res) ;
  }
  dailyData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion + '&fecha_hora=gte.' + fechaIncio + '&fecha_hora=lte.' + fechaFin;
    return this._http.get<any>(urlBase + args, httpOptions)
    .map(res => res) ;
  }
  montlyData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion + '&fecha_hora=gte.' + fechaIncio + '&fecha_hora=lte.' + fechaFin;
    return this._http.get<any>(urlBase + args, httpOptions)
    .map(res => res);
  }
  aggregatedPrecipitation(fechaIncio, fechaFin) {
    const urlBase = 'http://elaacgresf00.enelint.global/e1011/rpc/get_precipitacion_estaciones_color?';
    const body = { fecha_inicio :  fechaIncio,
            fecha_fin : fechaFin};
    return  this._http.post(urlBase, JSON.stringify(body) , httpOptions)
    .map((res: Response ) => {
      const data = res;
      console.log(data);
      return data;
    });
  }

}
