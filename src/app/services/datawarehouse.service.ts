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

  constructor(private http: HttpClient) { }

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
}
