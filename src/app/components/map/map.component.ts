import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';

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

  features = [];
  info = [];
  popup: any;

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

      // AÑADO CAPA ESTACIONES VM ULTIMO DATO
      // tslint:disable-next-line: variable-name
      const capaEstaciones_info = {
        href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/dwh/layers/vm_ultimo_dato_estacion.json',
        name: 'vm_ultimo_dato_estacion',
        show: true
      };
      const capaEstaciones = this.addLayerWFS(this.geoservice.DWHS, capaEstaciones_info.name, false);
      let select: any;
      const selectPointerMove = new Select({
        condition: pointerMove,
        layer: capaEstaciones
      });
      select = selectPointerMove;
      this.map.addInteraction(select);

      // OVERLAY
      this.popup = document.getElementById('myPopup');
      const overlay = new Overlay({
        element: this.popup,
        autoPan: true
      });

      // POPUP
      this.map.on('singleclick', (evt: any) => {
        this.features = [];
        this.info = [];
        let coord: any;
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
        this.initializePopup();
        this.map.forEachFeatureAtPixel(evt.pixel, feature => {
          coord = evt.pixel;
          this.info.push({
            nombreEntidad: feature.values_.nombre_entidad,
            nombreEstacion: feature.values_.nombre_estacion,
            idEstacion: feature.values_.id_estacion,
            nombreSensor: feature.values_.nombre_sensor,
            unidadSensor: feature.values_.unidad,
            fecha: new Date(feature.values_.fecha_hora).toLocaleString('es-CO'),
            valor: feature.values_.valor.toFixed(3)
          });
          console.log(feature);
          console.log(this.info);
        });
        this.createPopup();
      });
      this.map.addOverlay(overlay);
      // TOOLTIP
      // this.map.on('pointermove', (evt: any) => {
      //   this.features = [];
      //   this.info = [];
      //   let coord: any;
      //   const coordinate = evt.coordinate;
      //   overlay.setPosition(coordinate);
      //   popup.classList.toggle('show');
      //   this.map.forEachFeatureAtPixel(evt.pixel, feature => {
      //     coord = evt.pixel;
      //     this.info.push({
      //       sensor: feature.values_.id_sensor,
      //       estacion: feature.values_.nombre_estacion,
      //       fecha: new Date(feature.values_.fecha_hora).toLocaleString('es-CO'),
      //       valor: feature.values_.valor.toFixed(3),
      //       idestacion: feature.values_.id_estacion
      //     });
      //     console.log(coordinate);
      //     console.log(this.info);
      //   });
      //   this.createTooltip();
      // });
      // this.map.addOverlay(overlay);

      // Recibir respuesta de servicio de capas en cola y determinar acción
      this.interaction.mapInteraction.subscribe((layer: any) => {
        const type = this.getLayerTypeFromHref(layer);
        console.log(layer);
        // Si se debe mostrar
        if (layer.show) {
          if (type && type === this.geoservice.BASE) {
            this.addLayerWMS(layer.name, layer.edit);
          } else if (type && (type === this.geoservice.TEMS || type === this.geoservice.DWHS)) {
            this.addLayerWFS(type, layer.name, layer.edit);
          } else {
            alert('Something went Wrong!!');
          }
        // Si no se debe mostrar
        } else {
          this.removeLayer(layer.name);
        }
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
            LAYERS: `base:${name}`
          },
          opacity: (0.5),
          ration: 1
        });
        imageSource.on('imageloadend', () => {
          this.progressBar(name, false, edit);
        });
        newLayer = new ImageLayer({
          source: imageSource
        });
      }
      this.saveLayer(name, newLayer);
    }

    addLayerWFS(type: string, name: string, edit: boolean) {
      let newLayer: any;
      // tslint:disable-next-line: prefer-const
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
            radius: 2,
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

    createPopup() {
      this.interaction.setPopup(this.info, true);
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
      console.log(rows);
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < rows.length; index++) {
        rows[index].classList.add('popupbodytext');
        rows[index].classList.remove('popupbodytext-selected');
      }
      console.log(rows);
    }

    createTooltip() {
      this.interaction.setTooltip(this.info);
    }

  }
