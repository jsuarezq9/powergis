import { Component, OnInit } from '@angular/core';
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

import * as ol from 'ol/layer';

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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {


  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;

  layers = {};

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

      // Recibir respuesta de servicio de capas en cola y determinar acción
      this.interaction.mapInteraction.subscribe((layer: any) => {
        const type = this.getLayerTypeFromHref(layer);
        if (type && type === this.geoservice.BASE && layer.show) {
          this.addLayerBase(layer.name);
        } else if (type && (type === this.geoservice.TEMS || type === this.geoservice.DWHS) && layer.show) {
          this.addLayerWFS(type, layer.name);
        } else if (!layer.show) {
          this.removeLayer(layer.name);
          console.log('---------- Remove layers org, layer', layer)
          console.log('---------- Remove layers org, layer.name', layer.name)
        } else {
          alert('Something went Wrong!!');
        }
        console.log(this.layers);
      });

      this.map.addControl(new Zoom({
        target: document.getElementById('control-zoom')
      }));
      this.map.addControl(new ScaleLine({
        target: document.getElementById('control-scale')
      }));

    }

    addLayerBase(name: string) {
      let newLayer: any;
      this.progressBar(name, true);
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name];
        this.progressBar(name, false);
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
          this.progressBar(name, false);
        });
        newLayer = new ImageLayer({
          source: imageSource
        });
      }
      this.saveLayer(name, newLayer);
    }

    addLayerWFS(type: string, name: string) {
      let newLayer: any;
      if (this.layers[name] && this.layers[name] !== undefined) {
        newLayer = this.layers[name];
        this.saveLayer(name, newLayer);
      } else {
        this.progressBar(name, true);
        this.requestLayer(type, name);
      }
    }

    requestLayer(type: string, name: string) {
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
            document.getElementById(`${name}-progress`).classList.add('bg-danger');
            vectorSource.removeLoadedExtent(extent);
            // tslint:disable-next-line: no-string-literal
            document.getElementById(`${name}`)['checked'] = false;
            alert(`Error while requesting (${name} - ${type})`);
            // document.getElementById(`${name}-progress`).style.display = 'none';
          };
          xhr.onerror = onError;
          xhr.onload = () => {
            if (xhr.status === 200) {
              document.getElementById(`${name}-progress`).style.display = 'none';
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

    }

    progressBar(name: string, status: boolean): void {
      document.getElementById(`${name}-progress`).style.display = status ? 'block' : 'none';
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
        console.log(element);
        this.removeLayer(element);
        // tslint:disable-next-line: no-string-literal
        document.getElementById(`${element}`)['checked'] = false;
      }
    }





//     const container = document.getElementById('popup');
//     const content = document.getElementById('popup-content');
//     const closer = document.getElementById('popup-closer');
    // const overlay = new Overlay({
    //   element: container,
    //   autoPan: true,
    //   autoPanAnimation: {
    //     duration: 250
    //   }
    // });
    // closer.onclick = function() {
    //   overlay.setPosition(undefined);
    //   closer.blur();
    //   return false;
    // };
//     const vectorSource = new VectorSource({
//       format: new GeoJSON(),
//       loader(extent, resolution, projection) {
//         const proj = projection.getCode();
//         const url = 'http://elaacgresf00.enelint.global:8080/geoserver/tem/wfs?service=WFS&' +
//           'version=1.1.0&request=GetFeature&typename=tem:c020101_sin&' +
//           'outputFormat=application/json&srsname=' + proj + '&' +
//           'bbox=' + extent.join(',') + ',' + proj;
//         const xhr = new XMLHttpRequest();
//         xhr.open('GET', url);
//         const onError = function () {
//           vectorSource.removeLoadedExtent(extent);
//         }
//         xhr.onerror = onError;
//         xhr.onload = function () {
//           if (xhr.status == 200) {
//             vectorSource.addFeatures(
//               vectorSource.getFormat().readFeatures(xhr.responseText));
//           } else {
//             onError();
//           }
//         }
//         xhr.send();
//       },
//       strategy: bboxStrategy
//     });

//     const vector = new VectorLayer({
//       source: vectorSource,
//       style: new Style({
//         /*
//         image: new Circle({
//           radius: 7,
//           fill: new Fill({
//             color: 'rgba(0, 191, 255, 1.0)'
//           }),
//           stroke: new Stroke({
//             color: 'rgba(0, 0, 255, 1.0)',
//             width: 1
//           })
//         })*/
//         fill: new Fill({
//           color: 'rgba(120, 191, 255, 0.6)'
//         }),
//         stroke: new Stroke({
//           color: 'rgba(0, 0, 255, 0.8)',
//           width: 2
//         })
//       })
//     });
//     // agregar capa vector al mapa
//     map.addLayer(vector);

//     map.on('singleclick', (evt) => {

//       const coordinate = evt.coordinate;
//       const hdms = toStringHDMS(toLonLat(coordinate));

//       console.log(vector.getSource().getFeaturesAtCoordinate(coordinate));

//       content.innerHTML = '<p>Current coordinates are :</p><code>' + hdms +
//         '</code>';
//       overlay.setPosition(coordinate);
//       const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
//         // you can add a condition on layer to restrict the listener
//         layer = [vector, vector2];
//         return feature;
//       });
//       if (feature) {
//         // here you can add you code to display the coordinates or whatever you want to do
//         console.log(feature);
//         content.innerHTML = '<p>nombre :<code>' + feature.values_.nombre +
//           '</code></p> <p>Area: <code>' + feature.values_.shape_area +
//           '</code></p>' +
//           '</code></p> <p>Nombre Estación: <code>' + feature.values_.nombre_estacion +
//           '</code></p>' +
//           '</code></p> <p>Nombre Sensor: <code>' + feature.values_.nombre_sensor +
//           '</code>' + ' valor: ' + feature.values_.valor + ' ' + feature.values_.unidad + '</p>';
//       }
//     });
  // }

}
