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
  RASTERS = 'raster';
  WMS = 'wms';
  WFS = 'wfs';
  XM='xm';
  RASTER = 'raster';
  APPJSON = 'application/json';
  host = 'http://10.154.80.177';
  port = 8080;
  uriWorkSpace = '/geoserver/rest/workspaces';
  uriInfo = '/geoserver';
  authBasic = 'Basic YWRtaW46Z2Vvc2VydmVy';
  baseLayers: any[];
  temLayers: any[];

  constructor(private http: HttpClient) {
  }

  getInfo(layer: any) {
    // http://elaacgresf00.enelint.global:8080/geoserver/dwh/wfs?service=
    // WFS&version=1.1.0&request=GetFeature&typename=dwh:vm_ultimo_dato_estacion&
    // PROPERTYNAME=id_estacion,nombre_estacion&outputFormat=application/json
    // VIEW
    // http://elaacgresf00.enelint.global:8080/geoserver/info/ows?service=
    // WFS&version=1.0.0&request=GetFeature&typeName=info%3Ac010101_nal_col_view&
    // maxFeatures=5000&outputFormat=application%2Fjson
    const source = 'info';
    const headers = new HttpHeaders({
      Authorization: this.authBasic,
      'content-type': this.APPJSON
    });
    let params = new HttpParams();
    params = params.append('service', `WFS`);
    params = params.append('version', `1.0.0`);
    params = params.append('request', `GetFeature`);
    params = params.append('typename', `${source}:${layer}`);
    // params = params.append('PROPERTYNAME', `${properties}`);
    params = params.append('outputFormat', this.APPJSON);

    return this.http.get(`${this.host}:${this.port}${this.uriInfo}/${source}/ows`, { headers, params });
  }

  getLayersName(source: string, name: string) {
    const headers = new HttpHeaders({
      Authorization: this.authBasic,
      'content-type': this.APPJSON
    });
    return this.http.get(`${this.host}:${this.port}${this.uriWorkSpace}/${source}/layers/${name}`, { headers })
    .pipe( map ((response: any) => {
      return response.layer.attribution.title ? response.layer : null;
    }));
  }

  getRasterLegend(name: string) {
    const type = 'raster';
    const  headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.append('VERSION', '1.1.0');
    params = params.append('SERVICE', 'WMS');
    params = params.append('REQUEST', 'GetLegendGraphic');
    params = params.append('FORMAT', 'image/png');
    params = params.append('TRANSPARENT', 'false');
    params = params.append('LAYER', `${type}:${name}`);
    params = params.append('format_options', 'layout:precipitation');
    return `${this.host}:${this.port}${this.uriInfo}/${type}/wms?
      ?VERSION=1.1.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&
      TRANSPARENT=true&LAYER=${type}:${name}&format_options=layout:precipitation`;
  }

  getLayers(source: string) {
    const headers = new HttpHeaders({
      Authorization: this.authBasic,
      'content-type': this.APPJSON
    });
    return this.http.get(`${this.host}:${this.port}${this.uriWorkSpace}/${source}/layers`, { headers })
      .pipe( map ((response: any) => {
        return this.retrieveInfo(response);
    }));
  }

  retrieveInfo(layers: any): any[] {
    return layers.layers.layer;
  }

}
