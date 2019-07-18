/* servicio creado para manejar las consultas a XM  mediante API generada por Cargador/Bajador
fecha de inclusion:7/16/2019
version 0
*/
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class XmdespachoService {

  host = '/serviciosRestful/genproyectada_sin.php';
  token = environment.XM_TOKEN;
  contentType = 'application/x-www-form-urlencoded';
  httpOptions = {
    headers: new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      //"Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
      "Access-Control-Allow-Headers": "*"
    })
  };

  constructor(private http: HttpClient) { }

  getDespachoSin(fechaInicio, fechaFin, planta) {



    const data = JSON.stringify({
      planta,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Basic " + btoa("POWERGIS:987123"));
    headers = headers.append('Content-type', 'application/json');
    //headers = headers.append('Origin', '127.0.0.1' );
    //headers = headers.append("Connection", "keep-alive" );
    return this.http.post(this.host, data , { headers })
      .pipe(
        map((res: Response) => {
          const datas = res;
          return datas;
        })
      );



    // // let headers = new HttpHeaders();
    // // headers = headers.append('Authorization', 'Basic EGMA:');
    // // headers = headers.append('Content-Type', this.contentType);
    // const body = JSON.stringify({
    //   "planta": "FULL",
    //   "fecha_inicio": "10-07-2019",
    //   "fecha_fin": "10-07-2019"
    // });
    // console.log(body);
    // return this.http.post(urlBase, body, { headers });
  }

}
