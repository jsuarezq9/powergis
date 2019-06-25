import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
// OL
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import OlView from 'ol/View';
import { fromLonLat } from 'ol/proj';
import lVector from 'ol/layer/Vector';

import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import { Tile as OlTileLayer, Vector as VectorLayer, } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {Style, Stroke, Circle, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import { Zoom, ScaleLine} from 'ol/control';
import { Select } from 'ol/interaction';
import { events } from 'ol/events';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';

import * as moment from 'moment';
import WMSGetFeatureInfo from 'ol/format/WMSGetFeatureInfo';
import View from 'ol/View';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import * as jsonPath from 'jsonpath/jsonpath';
import { DatawarehouseService } from '../../services/datawarehouse.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @Output() selected = new EventEmitter();

  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;

  layers = {};
  layersInfo = {};

  popup: any;
  features = [];
  info = [];
  tooltip: any;
  tooltipvalue = [];
  loadingTooltip: boolean;
  prueba: string;

  precipitacionFechaInicio: any;
  precipitacionFechaFin: any;

  precipitation = {};

  constructor(private geoservice: GeoserverService,
              private interaction: ComponentsInteractionService,
              private datawarehouse: DatawarehouseService,
              private http: HttpClient) { }

    ngOnInit() {
      this.source = new OlXYZ({
        url: 'http://tile.osm.org/{z}/{x}/{y}.png'
      });
      this.layer = new OlTileLayer({
        source: this.source
      });
      this.view = new OlView({
        center: fromLonLat([-74, 4]),
        zoom: 6
      });
      this.map = new OlMap({
        target: 'map',
        layers: [this.layer],
        // span: true,
        view: this.view,
        controls: []
      });

      this.tooltip = document.getElementById('myTooltip');
      const overlay = new Overlay({
        element: this.tooltip,
        autoPan: true
      });
      this.map.addOverlay(overlay);

      // SUSCRIPCIONES
      // 1. Gestión de capas Módulo 1
      this.interaction.mapInteraction.subscribe(( layer: any ) => {
        const type = this.getLayerTypeFromHref(layer);
        this.removeTooltip();
        if (layer.show) {
          if (type) {
            this.addLayerTileWMS(layer.name, type, layer.edit, overlay);
            this.prepareWMSData(layer.name);
          } else {
            alert('Something went Wrong!!');
          }
        } else {
          this.removeLayer(layer.name);
        }
      });

      // 2. Mostrar capa estaciones módulo 2
      this.interaction.stationsInteraction.subscribe((layer: any) => {
        console.log('AGREGANDO CAPA ESTACIONES', layer);
        const type = this.getLayerTypeFromHref(layer);
        const layerStations = this.addStationsWFS(type, layer.name, layer.style);
        const selectPointerMove = new Select({
          condition: pointerMove,
          style: layer.selectedstyle.hidroSelected,
          layer: layerStations
        });
        this.map.addInteraction(selectPointerMove);
        this.addPopupStations();
      });

      // 3. Mostrar capa estaciones módulo 3
      this.interaction.precipitationInteraction.subscribe((layer: any) => {
        console.log('AGREGANDO CAPA ESTACIONES', layer);
        const type = this.getLayerTypeFromHref(layer);
        this.getAggregatedData(this.precipitacionFechaInicio, this.precipitacionFechaFin, type, layer.name);
        this.addPopupPrecipitation();
      });

      // 4. Mostrar raster
      this.interaction.rastersInteraction.subscribe((rasterSeleccionado: any) => {
        // Preparando consulta al servicio
        const rasterArray = rasterSeleccionado.name.split('_');
        const deltaDate = rasterArray[2];
        const deltaDateTime = deltaDate.substring( deltaDate.length - 1, deltaDate.length).toLowerCase();
        const deltaDatePeriod = deltaDate.substring( 0, deltaDate.length - 1);

        const now = moment().format('YYYY-MM-DD hh:mm');
        const fechaInicio = moment().subtract(deltaDatePeriod, deltaDateTime).format('YYYY-MM-DD hh:mm');
        this.precipitacionFechaInicio = fechaInicio;
        this.precipitacionFechaFin = now;

        // Agregando raster
        const type = this.getLayerTypeFromHref(rasterSeleccionado);
        if (type && type === this.geoservice.RASTERS) {
          this.addLayerTileWMS(rasterSeleccionado.name, type, false, false);
        }

      });

      // 5. Cambio a view del mapa base
      this.interaction.mapviewInteraction.subscribe((info: any) => {
        this.map.getView().setCenter(fromLonLat(info.coordinates));
        this.map.getView().setZoom(info.zoom);
      });

      // Agregar controles
      this.map.addControl(new Zoom({
        target: document.getElementById('control-zoom')
      }));
      this.map.addControl(new ScaleLine({
        target: document.getElementById('control-scale')
      }));
    }


    // MODULO 3 funciones
    addPopupPrecipitation() {
      const hooverContainer = document.getElementById('popup-hoover');
      const hoover = new Overlay({
        element: hooverContainer,
        autoPan: false,
        autoPanAnimation: {
          duration: 250
        }
      });
      this.map.addOverlay(hoover);

      let featureOnHover = Feature;
      this.map.on('pointermove', (evt) => {
        featureOnHover = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return feature;
        });
        if (featureOnHover) {
          hoover.setPosition(evt.coordinate);
          if (featureOnHover.get('nombre')) {
            hooverContainer.innerHTML = featureOnHover.getProperties().nombre;
            hooverContainer.style.display = 'block';
          } else if (featureOnHover.get('nombre_estacion')) {
            hooverContainer.innerHTML = featureOnHover.get('nombre_estacion');
            if ( jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + featureOnHover.get('id_estacion') + '" )]')[0]) {
              hooverContainer.innerHTML += '<p>Precipitación: ' +
              jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + featureOnHover.get('id_estacion') + '" )]')[0].precipitacion
                .toFixed(3) +
              '</p><p>Datos Analizados: ' +
              jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + featureOnHover.get('id_estacion') + '" )]')[0].cuenta +
              '</p>' +
              jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + featureOnHover.get('id_estacion') + '" )]')[0].color_rgb;
              hooverContainer.style.display = 'inline-block';
          }
        }
        } else {
          hooverContainer.style.display = 'none';
        }
      });
      this.map.render();
      
    }

    getAggregatedData(fechaInicio, fechaFin, type: any, name: any) {
      this.datawarehouse.aggregatedPrecipitation(fechaInicio, fechaFin)
      .subscribe((data: any) => {
          this.precipitation = { data };
          this.addPrecipitationWFS(type, name);
        },
          (error) => console.log(error)
        );
    }

    addPrecipitationWFS(type: string, name: string) {
      const CQLfilter = 'id_sensor=%270240%27';
      const vectorSource = this.requestLayerWFS(type, name, CQLfilter);
      const vector = this.stylePrecipitationsLayer(vectorSource, name);
    }

    stylePrecipitationsLayer(vectorSource: any, name: any) {
      const setStyle = (feature: any) => {
        if (jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + feature.get('id_estacion') + '" )]')[0]) {
          try {
            const color_rgb = jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' +
            feature.get('id_estacion') + '" )]')[0].color_rgb;
            const colorarray = color_rgb.split(',');
            const colorR = colorarray[0];
            const colorG = colorarray[1];
            const colorB = colorarray[2];

            const styles = {
              Default: new Style({
                image: new Circle({
                  radius: 7,
                  fill: new Fill({ color: 'rgba(' + colorR + ',' + colorG + ',' + colorB + ', 0.8)' }),
                  stroke: new Stroke({ color: 'rgba(255, 255, 255, 0.8)', width: 2 })
                })
              })
            };
            return styles.Default;
          } catch (error) {
            console.log(error);
          }
        } else {
            const style = {
            Default: new Style({
              image: new Circle({
                radius: 5,
                stroke: new Stroke({ color: 'rgba(0, 0, 255, 0.8)', width: 2 })
              })
            })
          };
            return style.Default;
        }
      };
      const vector = new VectorLayer({
        source: vectorSource,
        renderMode: 'vector',
        style: setStyle
      });
      this.saveLayer(name, vector);
      const selectPointerMove = new Select({
        condition: pointerMove,
        style: setStyle,
        layer: vector
      });
      this.map.addInteraction(selectPointerMove);
      return vector;
    }
    // FIN MODULO 3


    // MODULO 1 funciones -----------------------------------------------
    addLayerTileWMS(name: string, type: any, edit: boolean, overlay ?: any) {
      this.tooltipvalue = [];
      if (edit) {
      this.progressBar(name, true, edit);
      }
      let newLayer: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name].layer;
        if (edit) {
        this.progressBar(name, false, edit);
        }
      } else {
        const imageSource = new TileWMS({
          url: `http://10.154.80.177:8080/geoserver/${type}/wms`,
          serverType: 'geoserver',
          params: {
            VERSION: '1.1.0',
            WIDTH: 500,
            HEIGHT: 500,
            BBOX: '-81.8100662231445,-4.31388235092163,-66.7727737426758,13.4828310012817',
            SRS: 'EPSG:4686',
            LAYERS: `${type}:${name}`,
            // TRANSPARENT: true
          },
          ration: 1
        });
        if (edit) {
          imageSource.on('imageloadend', () => {
            this.progressBar(name, false, edit);
          });
        }
        newLayer = new OlTileLayer({
          visible: true,
          source: imageSource
        });
      }
      newLayer.setOpacity(0.5);
      this.saveLayer(name, newLayer);
      this.eventTooltip(newLayer, overlay);
    }

    eventTooltip(newLayer: any, overlay: any) {

      this.map.on('click', (evt: any) => {

        this.removeTooltip();
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);

        this.tooltipvalue = [];
        const viewProjection = this.map.getView().getProjection();
        const viewResolution = this.map.getView().getResolution();
        const url = newLayer.values_.source.getGetFeatureInfoUrl(
          evt.coordinate, viewResolution, viewProjection, {INFO_FORMAT: 'application/json'});
        this.http.get(url).subscribe( (data: any) => {
          // Si responde algo que no es vacío,
          if (data.features.length > 0) {
            const layerNameAtPixel =  data.features[0].id.split('.', 1)[0];
            if (this.layers[layerNameAtPixel].show) {
            const layerIdAtPixel =  data.features[0].id;
            const loadId = setInterval(() => this.manageInterval(layerNameAtPixel, layerIdAtPixel, loadId), 1000);
          }
          } else {
            this.removeTooltip();
          }

        });
      });
    }

    addInfoWFS(type: string, name: string, attributes ?) {
      let newLayer: any;
      let vector: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name].layer;
        vector = '';
      } else {
        vector = this.requestLayerWFS(type, name);
      }
      return vector;
    }

    prepareWMSData(name: string) {
      const nameView = `${name}_view`;
      this.geoservice.getInfo(nameView).subscribe( (data: any) => {
        this.layersInfo[name] = data.features;
      }, ((error: any) => {
        this.layersInfo[name] = error.ok;
      }));
    }

    manageInterval(layerName, layerId, intervalId) {
      // Si aún no hay información,
      if (this.layersInfo[layerName] === undefined) {
        this.loadingTooltip = true;
      // Si ya hay,
      } else {
        // Y si es diferente de "false"
        if (this.layersInfo[layerName]) {
          this.loadingTooltip = false;
          const filter = this.layersInfo[layerName].filter((feature: any) => feature.id === layerId);
          if (filter.length > 0) {
            const filter2 = this.tooltipvalue.filter((feature: any) => feature[0].id.split('.', 1)[0] === layerName);
            if (filter[0].properties !== undefined && filter[0].properties.length === undefined) {
              filter[0].properties = this.setTooltipProperties(filter[0]);
            }
            filter[0].name = layerName;
            // Si el nombre de la capa ya existe, la reemplazo
            if (filter2.length !== 0) {
              const index = this.tooltipvalue.indexOf(filter2[0]);
              this.tooltipvalue[index] = filter;
            // Si el nombre de la capa no existe, la agrego
            } else {
              this.tooltipvalue.push(filter);
            }
            this.addTooltip();
          }
        }
        clearInterval(intervalId);
      }
    }

    setTooltipProperties(filter): any[] {
      const properties = [];
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < Object.keys(filter.properties).length; i++) {
        properties.push({
          key: Object.keys(filter.properties)[i],
          value: filter.properties[Object.keys(filter.properties)[i]]
        });
      }
      return properties;
    }

    addTooltip() {
      this.tooltip.classList.add('show');
    }

    removeTooltip() {
      this.tooltip.classList.remove('show');
    }

    progressBar(name: string, status: boolean, exists: boolean): void {
      if (exists) {
        document.getElementById(`${name}-progress`).style.display = status ? 'block' : 'none';
      }
    }
    // FIN MODULO 1


    // MODULO 2 funciones -----------------------------------------------
    addStationsWFS(type: string, name: string, styleIn: any) {
      const vectorSource = this.requestLayerWFS(type, name);
      const vector = this.styleStationsLayer(vectorSource, name, styleIn);
      return vector;
    }

    styleStationsLayer(vectorSource: any, name: any, styleIn: any) {

      const setStyle = (feature) => {
        if (feature.get('nombre_entidad') === 'EMGESA' ) {
          if (feature.get('estado_estacion') === 'Activa') {
            return styleIn.hidroEmgesaInactiva;
          } else {
            return styleIn.hidroEmgesaActiva;
          }
        } else {
          if (feature.get('estado_estacion') === 'Activa') {
            return styleIn.hidroInactiva;
          } else {
            return styleIn.hidroActiva;
          }
        }
      };

      const vector = new lVector({
        source: vectorSource,
        style: setStyle
      });
      this.saveLayer(name, vector);
      return vector;
    }

    addPopupStations() {
      // OVERLAY
      this.popup = document.getElementById('myPopup');
      const overlay = new Overlay({
        element: this.popup,
        autoPan: true
      });

      // POPUP
      this.map.on('singleclick', (evt: any) => {
        console.log('click');
        const info = [];
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
        this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          if ( feature.id_.split('.fid', 1)[0] === 'vm_estaciones_vsg') {
            const item = {
              nombreEntidad: feature.values_.nombre_entidad,
              idEstacion: feature.values_.id_estacion,
              nombreEstacion: feature.values_.nombre_estacion,
              estadoEstacion: feature.values_.estado_estacion
            };
            info.push(item);
          } else {
            console.log('No es la capa de estaciones');
          }
        }
        // , {
        //   layerFiltter: (layer) => {
        //     return layer.get('layer_name') === 'vector2';
        //   }
        // }
        );
        if (info.length > 0) {
          this.map.addOverlay(overlay);
          if (!this.popup.classList.contains('show')) {
            this.popup.classList.add('show');
          }
        } else {
          this.popup.classList.remove('show');
        }
        this.createPopup(info[0]);
      });

    }

    createPopup(info) {
      this.interaction.setPopup(info);
    }

    initializePopup() {
      // Muestro el popup
      this.popup.classList.toggle('show');

      // Escondo el popupExpanded y el popupModule
      const popupExpanded = document.getElementById('myPopupExpandedContainer');
      popupExpanded.style.display = 'none';
      const popupModule = document.getElementById('moduleHidroPopup');
      popupModule.style.display = 'none';

      // Reinicio la selección de sensor del popup
      const rows = document.getElementsByClassName('popupbodytext-selected');
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < rows.length; index++) {
        rows[index].classList.add('popupbodytext');
        rows[index].classList.remove('popupbodytext-selected');
      }
    }
    // FIN MODULO 2


    // GENERALES
    requestLayerWFS(type: string, name: string, CQLfilter ?: any) {
      console.log(CQLfilter);

      const vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader(extent, resolution, projection) {
          const proj = projection.getCode();
          const url = `http://elaacgresf00.enelint.global:8080/geoserver/wfs?service=WFS&
          version=1.1.0&request=GetFeature&typename=${type}:${name}& +
          ${CQLfilter}outputFormat=application/json&outputFormat=application/json&srsname=${proj}&
          bbox=${extent.join(',')},${proj}`;
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          const onError = () => {
            vectorSource.removeLoadedExtent(extent);
            alert(`Error while requesting (${name} - ${type})`);
          };
          xhr.onerror = onError;
          xhr.onload = () => {

            if (xhr.status === 200) {
              vectorSource.addFeatures(vectorSource.getFormat().readFeatures(xhr.responseText));
            } else {
              onError();
            }
          };
          xhr.send();
        },
        strategy: bboxStrategy
      });
      return vectorSource;
    }

    saveLayer(name: string, layer: any) {
      this.layers[name] = {
        layer,
        show: true
      };
      this.map.addLayer(layer);
    }

    removeLayer(name: string) {
      if (this.layers[name]) {
        this.layers[name].show = false;
        this.map.removeLayer(this.layers[name].layer);
      }
    }

    getLayerTypeFromHref(layer: any): string {
      const uri = `${layer.href}`;
      if (uri.search(this.geoservice.BASE) > 0) {
        return this.geoservice.BASE;
      } else if (uri.search(this.geoservice.TEMS) > 0) {
        return this.geoservice.TEMS;
      } else if (uri.search(this.geoservice.DWHS) > 0) {
        return this.geoservice.DWHS;
      } else if (uri.search(this.geoservice.RASTERS) > 0) {
        return this.geoservice.RASTERS;
      } else {
        return null;
      }
    }

    resetLayers() {
      const length = Object.keys(this.layers).length;
      const keys = Object.keys(this.layers);

      for (let index = 0; index < length; index++) {
        const element = keys[index];
        this.removeLayer(element);
        // tslint:disable-next-line: no-string-literal
        document.getElementById(`${element}`)['checked'] = false;
      }
    }

  }
