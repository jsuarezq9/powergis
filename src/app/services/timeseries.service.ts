import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class TimeSeriesService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // tslint:disable-next-line: max-line-length
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZ2VzdG9yX2ludGVybm8iLCJlbWFpbCI6ImFuZHJlcy52ZWxhc2NvQGVuZWwuY29tIiwiZXhwIjoxNTc3MTQ1NjAwfQ.57g7-Xu2R8OBWHODxHsQ9y3twsICBPg2uf7-oc1twT0'
    })
  };
  constructor(private http: HttpClient) { }

  rawData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion +
    '&fecha_hora=gte.' +
    fechaIncio + '&fecha_hora=lte.' +
    fechaFin + '&id_sensor=eq.' +
    sensor;
    return this.http.get<any>(urlBase + args, this.httpOptions);
  }

  hourlyData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion + '&fecha_hora=gte.' + fechaIncio + '&fecha_hora=lte.' + fechaFin;
    return this.http.get<any>(urlBase + args, this.httpOptions);
  }
  dailyData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion + '&fecha_hora=gte.' + fechaIncio + '&fecha_hora=lte.' + fechaFin;
    return this.http.get<any>(urlBase + args, this.httpOptions);
  }
  monthlyData(idEstacion, fechaIncio, fechaFin, sensor ) {
    const urlBase = 'http://slaawgresf00.enelint.global/dwh/t101101_datos?';
    const args = 'id_estacion=eq.' + idEstacion + '&fecha_hora=gte.' + fechaIncio + '&fecha_hora=lte.' + fechaFin;
    return this.http.get<any>(urlBase + args, this.httpOptions);
  }
  aggregatedPrecipitation(fechaInicio, fechaFin) {
    const urlBase = 'http://elaacgresf00.enelint.global/e1011/rpc/get_precipitacion_estaciones_color?';
    const body = {fecha_inicio :  fechaInicio,
                  fecha_fin : fechaFin};
    return  this.http.post(urlBase, JSON.stringify(body) , this.httpOptions);
  }

}
