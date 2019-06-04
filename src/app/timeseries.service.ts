import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY29uc3VsdGFfZXh0ZXJuYSIsImVtYWlsIjoibG9zcG9sbG9zaGVybWFub3NAbWFpbC5jb20iLCJleHAiOjE1NjE4NTI4MDB9.uQBIH44x2LFL__8QAJiYcRSIK_aTlWU3qKCrM8Klbn0'
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
    .map(res => res) ;
  }
}
