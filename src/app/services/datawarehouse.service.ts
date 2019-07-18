import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatawarehouseService {

  host = environment.HOST;
  token = environment.PRO_TOKEN;
  contentType = environment.APP_JSON;
  context = 'e1011';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // tslint:disable-next-line: max-line-length
      Authorization: 'Bearer '+ this.token
    })
  };


  constructor(private http: HttpClient) {  }

  getSensorByStation(startDate: string, endDate: string, idStation: string, idSensor: string) {
    console.log('Servicio!!!', startDate, endDate, idStation, idSensor);
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.token}`);
    headers = headers.append('content-type', this.contentType);
    let params = new HttpParams();
    params = params.append('fecha_hora', `gte.${startDate}`);
    params = params.append('fecha_hora', `lte.${endDate}`);
    params = params.append('id_estacion', `eq.${idStation}`);
    params = params.append('id_sensor', `eq.${idSensor}`);
    return this.http.get(`${this.host}/${this.context}/vm_datos_horario`, { headers, params})
    .pipe( map((data: any[]) => {
      let id;
      const total = [];
      const fecha = [];
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        id = element.id_sensor;
        total.push(element.total);
        fecha.push(element.fecha_hora);
      }
      return {
        [id] : {
          total,
          fecha
        }
      };
    }));
  }

  getSensorsLastInfoByStation(idStation: string) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.token}`);
    headers = headers.append('content-type', this.contentType);
    let params = new HttpParams();
    params = params.append('id_estacion', `eq.${idStation}`);
    return this.http.get(`${this.host}/${this.context}/vm_ultimo_dato_estacion`, { headers, params})
    .pipe( map((data: any[]) => {
      const info = [];
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const item = {
          idEstacion: element.id_estacion,
          idSensor: element.id_sensor,
          nombreSensor: element.nombre_sensor,
          unidadSensor: element.unidad,
          fecha: new Date(element.fecha_hora).toLocaleString('es-CO'),
          valor: element.valor.toFixed(3)
        };
        info.push(item);
      }
      return info;
    }));
  }

  getAggregatedPrecipitation(fechaIncio, fechaFin) {
    const urlBase = `${this.host}/${this.context}/rpc/get_precipitacion_estaciones_color?`;
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.token}`);
    headers = headers.append('content-type', this.contentType);
    const body = { fecha_inicio :  fechaIncio,
            fecha_fin : fechaFin};
    return  this.http.post(urlBase, JSON.stringify(body) , {headers})
    .pipe(
      map((res: Response ) => {
      const data = res;
      return data;
    })
    );
  }

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
