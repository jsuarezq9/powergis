import { Component, OnInit } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';

// OL
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import { fromLonLat } from 'ol/proj';

import * as ol from 'ol';

import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import sVector from 'ol/source/Vector';
import lVector from 'ol/layer/Vector';
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
    private interaction: ComponentsInteractionService) { 
    }
    
    ngOnInit() {
      // Crear capa base 
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
        view: this.view
        // view: this.view,
        // controls: ol.control.defaults().extend([new ol.control.ScaleLine])
      });

      // Recibir respuesta de servicio y determinar acción
      // this.interaction.mapInteraction.subscribe((layer: any) => {
      //   const type = this.getLayerTypeFromHref(layer);
      //   if (type && type === this.geoservice.BASE && layer.show) {
      //     this.addLayerBase(layer.name);
      //   } else if (type && type === this.geoservice.TEMS && layer.show) {
      //     this.addLayerWFS(type, layer.name);
      //   } else if (!layer.show) {
      //     this.removeLayer(layer.name);
      //   } else {
      //     alert('Something went Wrong!!');
      //   }
      // });
      
      let zoomslider = new ZoomSlider();
      this.map.addControl(zoomslider);

      let zoomslider_base = document.getElementsByClassName('ol-zoomslider')
      console.log(zoomslider_base)
      // zoomslider_base[0].style = `
      // top: 8px;
      // left: auto;
      // right: 8px;
      // background-color: rgba(255, 69, 0, 0.2);
      // width: 200px;
      // height: 15px;
      // padding: 0;
      // box-shadow: 0 0 5px rgb(255, 69, 0);
      // border-radius: 20px;
      // `
     
      // this.initilizeMap();
    }

  // Agregar zoom in y out.
  // initilizeMap(map: OlMap) {
  // 
  // }









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
//     // creo segunda capa tipo vector

//     const vectorSource2 = new VectorSource({
//       format: new GeoJSON(),
//       loader(extent, resolution, projection) {
//         const proj = projection.getCode();
//         const url = 'http://elaacgresf00.enelint.global:8080/geoserver/dwh/wfs?service=WFS&' +
//           'version=1.1.0&request=GetFeature&typename=dwh:vm_ultimo_dato_estacion&' +
//           'outputFormat=application/json&srsname=' + proj + '&' +
//           'bbox=' + extent.join(',') + ',' + proj;
//         const xhr = new XMLHttpRequest();
//         xhr.open('GET', url);
//         const onError = function () {
//           vectorSource2.removeLoadedExtent(extent);
//         }
//         xhr.onerror = onError;
//         xhr.onload = function () {
//           if (xhr.status == 200) {
//             vectorSource2.addFeatures(
//               vectorSource2.getFormat().readFeatures(xhr.responseText));
//           } else {
//             onError();
//           }
//         }
//         xhr.send();
//       },
//       strategy: bboxStrategy
//     });
// // agrego la segunda fuente de datos a una capa vectorlayer
//     const vector2 = new VectorLayer({
//       source: vectorSource2,
//       style: new Style({
//         image: new Circle({
//           radius: 7,
//           fill: new Fill({
//             color: 'rgba(0, 191, 255, 1.0)'
//           }),
//           stroke: new Stroke({
//             color: 'rgba(0, 0, 255, 1.0)',
//             width: 1
//           })
//         })
//        })
//     });

//     // agrego la capa al mapa
//     map.addLayer(vector2);

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
