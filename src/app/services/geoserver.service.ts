import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoserverService {
  BASE = 'base';
  TEMS = 'tem';
  host = 'http://10.154.80.177';
  port = 8080;
  uri = '/geoserver/rest/workspaces/';
  uriWFS = '/geoserver/tem/wfs';
  authBasic = 'Basic YWRtaW46Z2Vvc2VydmVy';
  contentType = 'application/json';
  baseLayers: any[];
  temLayers: any[];
  constructor(private http: HttpClient) { }

  getLayers(type: string) {
    const headers = new HttpHeaders({
      Authorization: this.authBasic,
      'content-type': this.contentType
    });
    return this.http.get(`${this.host}:${this.port}${this.uri}${type}/layers`, { headers });
  }

  getWFS(type: string, name: string) {
    const headers = new HttpHeaders({
      Authorization: this.authBasic
    });
// tslint:disable-next-line: max-line-length
    return this.http.get(`${this.host}:${this.port}/geoserver/${type}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${type}:${name}&maxFeatures=50&outputFormat=application/json`, { headers });
  }

}

