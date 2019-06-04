import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeoserverService {
  BASE = 'base';
  TEMS = 'tem';
  DWHS = 'dwh';
  WMS = 'wms';
  WFS = 'wfs';
  APPJSON = 'application/json';
  host = 'http://10.154.80.177';
  port = 8080;
  uriWorkSpace = '/geoserver/rest/workspaces';
  authBasic = 'Basic YWRtaW46Z2Vvc2VydmVy';
  baseLayers: any[];
  temLayers: any[];
  constructor(private http: HttpClient) { }

  getLayers(type: string) {
    const headers = new HttpHeaders({
      Authorization: this.authBasic,
      'content-type': this.APPJSON
    });
    return this.http.get(`${this.host}:${this.port}${this.uriWorkSpace}/${type}/layers`, { headers })
      .pipe( map ((response: any) => {
        return this.retrieveInfo(response);
    }));
  }

  retrieveInfo(layers: any): any[] {
    return layers.layers.layer;
  }

}
