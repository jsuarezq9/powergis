import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

// OL
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import OlView from 'ol/View';
import { fromLonLat } from 'ol/proj';
import lVector from 'ol/layer/Vector';

import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import sVector from 'ol/source/Vector';
import Point from 'ol/geom/Point';
// import { Tile as TileLayer, Vector as VectorLayer, } from 'ol/layer';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate.js';
import { toLonLat } from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import { defaults, control, ZoomSlider, OverviewMap, Zoom, ScaleLine, extend } from 'ol/control';
import { Select } from 'ol/interaction';
import { events } from 'ol/events';
import { HttpClient } from 'selenium-webdriver/http';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import { map } from 'rxjs/operators';
import { layer } from 'openlayers';

import * as moment from 'moment';

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

  popup: any;
  features = [];
  info = [];
  tooltip: any;
  tooltipvalue = [];


  constructor(private geoservice: GeoserverService,
              private interaction: ComponentsInteractionService) { }

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
        view: this.view,
        controls: []
      });

      // SUSCRIPCIONES
      // 1. Gestión de capas
      this.interaction.mapInteraction.subscribe((layer: any) => {
        const type = this.getLayerTypeFromHref(layer);
        if (layer.show) {
          if (type && type === this.geoservice.BASE) {
            this.addLayerWMS(layer.name, layer.edit);
          } else if (type && (type === this.geoservice.TEMS || type === this.geoservice.DWHS)) {
            this.addLayerWFS(type, layer.name, layer.edit);
          } else {
            alert('Something went Wrong!!');
          }
        } else {
          this.removeLayer(layer.name);
        }
      });

      // 2. Mostrar capa estaciones en módulos 2 y 3
      this.interaction.stationsInteraction.subscribe((layer: any) => {
        const type = this.getLayerTypeFromHref(layer);
        const layerStations = this.addStationsWFS(type, layer.name, layer.style);
        let select: any;
        const selectPointerMove = new Select({
          condition: pointerMove,
          style: layer.selectedstyle.hidroSelected,
          layer: layerStations
        });
        select = selectPointerMove;
        this.map.addInteraction(select);
        this.addPopup();
      });

      // 3. Cambio a view del mapa base
      this.interaction.mapviewInteraction.subscribe((info: any) => {
        console.log(this.map.getView());
        this.map.getView().setCenter(fromLonLat(info.coordinates));
        this.map.getView().setZoom(info.zoom);
      });

      this.map.addControl(new Zoom({
        target: document.getElementById('control-zoom')
      }));
      this.map.addControl(new ScaleLine({
        target: document.getElementById('control-scale')
      }));

      // this.addPopup();
      // this.addTooltip();

      // Añado capa nueva estaciones
      // const layerEstaciones1 = {
      //   href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/dwh/layers/vm_estaciones_vsg.json',
      //   name: 'vm_estaciones_vsg',
      //   edit: false,
      // };
      // const capaEstaciones1 = this.addLayerWFS(this.geoservice.DWHS, layerEstaciones1.name, false);
      // this.map.on('singleclick', (evt: any) => {
      //   const features = [];
      //   const info = [];
      //   const pixel = evt.pixel;
      //   this.map.forEachFeatureAtPixel(pixel, (feature) => {
      //     console.log('Feature: ', feature);
      //   });
      // });
    }



    addLayerWMS(name: string, edit: boolean) {
      this.progressBar(name, true, edit);
      let newLayer: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name];
        this.progressBar(name, false, edit);
      } else {
        const imageSource = new ImageWMS({
          url: 'http://10.154.80.177:8080/geoserver/base/wms',
          serverType: 'geoserver',
          params: {
            VERSION: '1..1.0',
            WIDTH: 500,
            HEIGHT: 500,
            BBOX: '-81.8100662231445,-4.31388235092163,-66.7727737426758,13.4828310012817',
            SRS: 'EPSG:4686',
            LAYERS: `base:${name}`,
            TRANSPARENT: true
          },
          ration: 1
        });
        imageSource.on('imageloadend', () => {
          this.progressBar(name, false, edit);
        });
        newLayer = new ImageLayer({
          source: imageSource
        });
      }
      newLayer.setOpacity(1);
      this.saveLayer(name, newLayer);
      console.log('------ Opacidad: ', newLayer.getOpacity());
    }

    addLayerWFS(type: string, name: string, edit: boolean) {
      let newLayer: any;
      let vector: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name];
        this.saveLayer(name, newLayer);
        vector = 'Ñó';
      } else {
        this.progressBar(name, true, edit);
        vector = this.requestLayer(type, name, edit);
      }
      return vector;
    }

    addStationsWFS(type: string, name: string, styleIn: any) {
      let vector: any;
      vector = this.requestStationsLayer(type, name, styleIn);
      return vector;
    }

    requestLayer(type: string, name: string, exists: boolean) {

      const vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader(extent, resolution, projection) {
          const proj = projection.getCode();
          const url = `http://elaacgresf00.enelint.global:8080/geoserver/${type}/${type === 'tem' ? 'wfs' : 'ows'}?service=WFS&
          version=1.1.0&request=GetFeature&typename=${type}:${name}& +
          outputFormat=application/json&outputFormat=application/json&srsname=${proj}&
          bbox=${extent.join(',')},${proj}`;
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          const onError = () => {
            vectorSource.removeLoadedExtent(extent);
            alert(`Error while requesting (${name} - ${type})`);
            console.log(exists, `${name}-progress`);
            if (exists) {
              document.getElementById(`${name}-progress`).classList.add('bg-danger');
              document.getElementById(`${name}-progress`).style.display = 'block';
              setTimeout(() => {
                document.getElementById(`${name}-progress`).style.display = 'none';
                // tslint:disable-next-line: no-string-literal
                document.getElementById(`${name}`)['checked'] = false;
              }, 1000);
            }
          };
          xhr.onerror = onError;
          xhr.onload = () => {
            if (xhr.status === 200) {
              if (exists) {
              document.getElementById(`${name}-progress`).style.display = 'none';
              }
              vectorSource.addFeatures(vectorSource.getFormat().readFeatures(xhr.responseText));
            } else {
              onError();
            }
          };
          xhr.send();
        },
        strategy: bboxStrategy
      });

      const vector = new lVector({
        source: vectorSource,
        style: new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({
              color: 'rgba(0, 191, 255, 1.0)'
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 255, 1.0)',
              width: 1
            })
          }),
          fill: new Fill({
            color: 'rgba(120, 191, 255, 0.6)'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 0.8)',
            width: 2
          })
        })
      });
      this.saveLayer(name, vector);
      return vector;

    }

    requestStationsLayer(type: string, name: string, styleIn: any) {

      const vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader(extent, resolution, projection) {
          const proj = projection.getCode();
          const url = `http://elaacgresf00.enelint.global:8080/geoserver/${type}/${type === 'tem' ? 'wfs' : 'ows'}?service=WFS&
          version=1.1.0&request=GetFeature&typename=${type}:${name}& +
          outputFormat=application/json&outputFormat=application/json&srsname=${proj}&
          bbox=${extent.join(',')},${proj}`;
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          const onError = () => {
            vectorSource.removeLoadedExtent(extent);
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

      const setStyle = (feature) => {
        if (feature.get('nombre_entidad') === 'EMGESA' ) {
          console.log(feature.get('estado_estacion'));
          if (feature.get('estado_estacion') === 'Activa') {
            // console.log('Emgesa inactiva -----------', styleIn.hidroEmgesaInactiva);
            return styleIn.hidroEmgesaInactiva;
          } else {
            // console.log('Emgesa activa ************', styleIn.hidroEmgesaActiva);
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
        // style: styleIn
        style: setStyle
      });
      this.saveLayer(name, vector);

      return vector;

    }

    progressBar(name: string, status: boolean, exists: boolean): void {
      if (exists) {
        document.getElementById(`${name}-progress`).style.display = status ? 'block' : 'none';
      }
    }

    saveLayer(name: string, layer: any) {
      this.layers[name] = layer;
      this.map.addLayer(layer);
    }

    removeLayer(name: string) {
      this.map.removeLayer(this.layers[name]);
    }

    getLayerTypeFromHref(layer: any): string {
      const uri = `${layer.href}`;
      if (uri.search(this.geoservice.BASE) > 0) {
        return this.geoservice.BASE;
      } else if (uri.search(this.geoservice.TEMS) > 0) {
        return this.geoservice.TEMS;
      } else if (uri.search(this.geoservice.DWHS) > 0) {
        return this.geoservice.DWHS;
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

    addPopup() {
      // OVERLAY
      this.popup = document.getElementById('myPopup');
      const overlay = new Overlay({
        element: this.popup,
        autoPan: true
      });

      // POPUP
      this.map.on('singleclick', (evt: any) => {
        console.log('Entra a popup');
        const features = [];
        const info = [];
        let coord: any;
        const coordinate = evt.coordinate;
        console.log('Entra a popup2');
        this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          // console.log('entró', feature.id_.split('.fid', 1)[0]);
          console.log('for each feature at pixel!!!');
          if ( feature.id_.split('.fid', 1)[0] === 'vm_estaciones_vsg') {
            console.log('Es la capa de estaciones');
            overlay.setPosition(coordinate);
            this.initializePopup();
            coord = evt.pixel;
            const item = {
              nombreEntidad: feature.values_.nombre_entidad,
              idEstacion: feature.values_.id_estacion,
              nombreEstacion: feature.values_.nombre_estacion,
              estadoEstacion: feature.values_.estado_estacion
              // idSensor: feature.values_.id_sensor,
              // nombreSensor: feature.values_.nombre_sensor,
              // unidadSensor: feature.values_.unidad,
              // fecha: new Date(feature.values_.fecha_hora).toLocaleString('es-CO'),
              // valor: feature.values_.valor.toFixed(3)
            };
            info.push(item);
          } else {
            console.log('No es la capa de estaciones');
          }
        });
        if (info.length > 0) {
          this.createPopup(info);
          this.map.addOverlay(overlay);
        } else {
          this.createPopup(info);
        }
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

    addTooltip() {
      // OVERLAY
      this.tooltip = document.getElementById('myTooltip');
      const overlay = new Overlay({
        element: this.tooltip,
        autoPan: true
      });

      // TOOLTIP
      // this.map.on('singleclick', (evt: any) => {
      this.map.on('pointermove', (evt: any) => {
        const infoArray = [];
        const coordinate = evt.coordinate;
        const pixel = this.map.getPixelFromCoordinate(coordinate);
        overlay.setPosition(coordinate);
        this.map.forEachFeatureAtPixel(pixel, (feature) => {
          const layerName = feature.id_.split('.', 1)[0];
          const keys = Object.keys(feature.values_);
          for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if (key.includes('serie_meno') || key.includes('nombre') ) {
              const item = {
                title: layerName,
                key: key,
                value: feature.values_[key],
              };
              if (infoArray.length > 0) {
                for (let i = 0; i < infoArray.length; i++) {
                  if (infoArray[i].title === item.title) {
                    infoArray[i] = item;
                  } else {
                    infoArray.push(item);
                  }
                }
              } else {
                infoArray.push(item);
              }
            }
          }
        });
        if (infoArray.length > 0) {
          this.tooltip.classList.add('show');
          this.map.addOverlay(overlay);
          this.tooltipvalue = infoArray;
          // console.log('Mostré el tooltip', infoArray)
        } else {
          this.tooltip.classList.remove('show');
          this.tooltipvalue = [];
        }
      });
    }
  }
