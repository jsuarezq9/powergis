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
import TileWMS from 'ol/source/TileWMS';
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
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import { map } from 'rxjs/operators';
import { layer, Tile } from 'openlayers';

import * as moment from 'moment';
import WMSGetFeatureInfo from 'ol/format/WMSGetFeatureInfo';
import View from 'ol/View';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  constructor(private geoservice: GeoserverService,
              private interaction: ComponentsInteractionService,
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
      // 1. Gestión de capas
      this.interaction.mapInteraction.subscribe((layer: any) => {
        const type = this.getLayerTypeFromHref(layer);
        this.removeTooltip();
        if (layer.show) {
          if (type && type === this.geoservice.BASE || type === this.geoservice.TEMS) {
            const properties = '';
            this.addLayerTileWMS(layer.name, layer.edit, layer.show, overlay);
            this.prepareWMSData(type, layer.name, properties);
            // Guardar en wfs también para extraer features. Input opcional de addLayerWFS deben ser los atributos
            // Si no hay atributos, que traiga todo. (postman)
          } else if (type && type === this.geoservice.DWHS) {
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
        this.addPopupStations();
      });

      // 3. Cambio a view del mapa base
      this.interaction.mapviewInteraction.subscribe((info: any) => {
        this.map.getView().setCenter(fromLonLat(info.coordinates));
        this.map.getView().setZoom(info.zoom);
      });

      this.map.addControl(new Zoom({
        target: document.getElementById('control-zoom')
      }));
      this.map.addControl(new ScaleLine({
        target: document.getElementById('control-scale')
      }));


    }



    addLayerWMS(name: string, edit: boolean) {
      this.progressBar(name, true, edit);
      let newLayer: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name].layer;
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
      newLayer.setOpacity(0.5);
      this.saveLayer(name, newLayer);
      // console.log('------ Opacidad: ', newLayer.getOpacity());
    }

    addLayerTileWMS(name: string, edit: boolean, show: boolean, overlay: any) {
      this.tooltipvalue = [];
      this.progressBar(name, true, edit);
      let newLayer: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name].layer;
        this.progressBar(name, false, edit);
      } else {
        const imageSource = new TileWMS({
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
          evt.coordinate, viewResolution, viewProjection, {'INFO_FORMAT': 'application/json'});
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
        // this.saveLayer(name, newLayer);
        vector = '';
      } else {
        vector = this.requestLayer(type, name, false);
      }
      return vector;
    }

    addLayerWFS(type: string, name: string, edit: boolean) {
      let newLayer: any;
      let vector: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name].layer;
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

    addPopupStations() {
      // OVERLAY
      this.popup = document.getElementById('myPopup');
      const overlay = new Overlay({
        element: this.popup,
        autoPan: true
      });

      // POPUP
      this.map.on('singleclick', (evt: any) => {
        const info = [];
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
        this.initializePopup();
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
        });
        if (info.length > 0) {
          this.map.addOverlay(overlay);
          this.createPopup(info[0]);
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

    prepareWMSData(type: string, name: string, properties: string) {
      this.geoservice.getInfo(type, name, properties).subscribe( (data: any) => {
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
  }
