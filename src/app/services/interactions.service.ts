import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentsInteractionService {

  public mapInteraction: Subject<any> = new Subject();
  public removeMapSelectInteraction: Subject<any> = new Subject();
  public removeRainLayer: Subject<any> = new Subject();
  public layerTitlesInteraction: Subject<any> = new Subject();
  public setActiveBaseLayers: Subject<any> = new Subject();
  public setFilterPlants: Subject<any> = new Subject();
  public mapviewInteraction: Subject<any> = new Subject();
  public stationsInteraction: Subject<any> = new Subject();
  public DespachoInteraction: Subject<any> = new Subject();
  public precipitationInteraction: Subject<any> = new Subject();
  public precipitationRainInteraction: Subject<any> = new Subject();
  public rastersInteraction: Subject<any> = new Subject();
  public popupDespachoInteraction: Subject<any> = new Subject();
  public popupInteraction: Subject<any> = new Subject();
  public tooltipInteraction: Subject<any> = new Subject();
  public timeSeriesInteraction: Subject<any> = new Subject();

  public layerTitlesPlusGeometryInteraction: Subject<any> = new Subject();

  constructor() {}

  setLayer(layer: any, show: boolean, edit: boolean): void {
    layer.show = show;
    layer.edit = edit;
    this.mapInteraction.next(layer);
  }

  setLayerTitles(layer: any): void {
    // console.log('INTERACTION');
    this.layerTitlesInteraction.next(layer);
  }

  setView(coordinates: any, zoom: any): void {
    const all = {
      coordinates,
      zoom
    };
    this.mapviewInteraction.next(all);
  }

  setSelectLayer(layer: any, show: boolean, edit: boolean): void {
    layer.show = show;
    layer.edit = edit;
    this.removeMapSelectInteraction.next(layer);
  }
  setRainLayer(layer: any, show: boolean, edit: boolean): void {
    layer.show = show;
    layer.edit = edit;
    this.removeRainLayer.next(layer);
  }

  setActiveLayers(layer: any) {
    this.setActiveBaseLayers.next(layer);
  }

  setStationsLayer(layer: any, styleIn: any, selectedStyleIn: any): any {
    layer.style = styleIn;
    layer.selectedstyle = selectedStyleIn;
    this.stationsInteraction.next(layer);
  }

  setStationsDespacho(layer: any, styleIn: any, selectedStyleIn: any, query?: any): any {
    layer.style = styleIn;
    layer.selectedstyle = selectedStyleIn;
    layer.query = query;
    this.DespachoInteraction.next(layer);
  }

  setFilterPlantsDespacho( query: any): any {
    this.setFilterPlants.next(query);
  }

  setPrecipitationLayer(layer: any, query: boolean, iniDate?: any, finDate?: any): any {
    layer.query = query;
    layer.iniDate = iniDate;
    layer.finDate = finDate;
    this.precipitationInteraction.next(layer);
  }
  setPrecipitationRainLayer(layer: any, query: boolean, iniDate?: any, finDate?: any): any {
    layer.query = query;
    layer.iniDate = iniDate;
    layer.finDate = finDate;
    this.precipitationRainInteraction.next(layer);
  }

  setRaster(layer: any): void {
    this.rastersInteraction.next(layer);
  }

  setPopup(info: any): void {
    this.popupInteraction.next(info);
  }

  setPopupDespacho(info: any): void {
    this.popupDespachoInteraction.next(info);
  }

  setTooltip(info: any): void {
    const tooltip = {
      info
    };
    this.tooltipInteraction.next(tooltip);
  }

  setSensor(sensor: object): void {
    this.timeSeriesInteraction.next(sensor);
  }

  returnInfoLayers(info: any): void {
    // console.log('returnInfoLayers!!!')
    this.layerTitlesPlusGeometryInteraction.next(info);
  }

}
