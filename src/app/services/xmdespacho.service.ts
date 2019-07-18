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

  host = 'http://10.152.165.45:8080/serviciosRestful/genproyectada.php';
  token = environment.XM_TOKEN;
  contentType = 'application/x-www-form-urlencoded';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain',
      Authorization: 'Basic RUdNQToxMjM0',
      Accept: '*/*',
      'Cache-Control': 'no-cache',
      Host: '10.152.165.45:8080',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Length': '87',
      Connection: 'keep-alive',
      'cache-control': 'no-cache'
    })
  };

  constructor(private http: HttpClient) { }

  getDespachoSin(fechaInicio, fechaFin) {

    const data = JSON.stringify({
      planta : "FULL",
      fecha_inicio : "10-07-2019",
      fecha_fin : "10-07-2019"
    });
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Basic " + btoa("EGMA:1234"));
    headers = headers.append('Content-type', 'application/json');
    //headers = headers.append('Origin', '127.0.0.1' );
    //headers = headers.append("Connection", "keep-alive" );
    return  this.http.post(this.host, JSON.stringify(data) , {headers})
    .pipe(
      map((res: Response ) => {
      const data = res;
      return data;
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
