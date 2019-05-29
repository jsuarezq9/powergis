import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj.js';
import { Tile as TileLayer, Vector as VectorLayer, } from 'ol/layer';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate.js';
import { toLonLat } from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import { WeatherService } from './weather.service';
import Chart from 'chart.js/dist/Chart.js';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Browser market shares at a specific website, 2014';
  type = 'PieChart';
  data = [
    ['Firefox', 45.0],
    ['IE', 26.8],
    ['Chrome', 12.8],
    ['Safari', 8.5],
    ['Opera', 6.2],
    ['Others', 0.7]
  ];
  columnNames = ['Browser', 'Percentage'];
  options = {};
  width = 550;
  height = 400;
  chart = [];

  constructor(private _weather: WeatherService) { }

  ngOnInit() {
    this.initilizeMap();

    this.initializeChart();
  }

  initilizeMap() {
    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const closer = document.getElementById('popup-closer');

    const overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };
    const base = new TileLayer({
      source: new TileJSON({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });
// or
    const map = new Map({
      // controls: [new Zoom(), new ZoomSlider(),
      //   new OverviewMap()
      // ],
      layers: [base],
      overlays: [overlay],
      target: 'map',
      view: new View({
        center: fromLonLat([-74.063644, 4.624335]),
        zoom: 7
      })
    });
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      loader(extent, resolution, projection) {
        const proj = projection.getCode();
        const url = 'http://elaacgresf00.enelint.global:8080/geoserver/tem/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=tem:c020101_sin&' +
          'outputFormat=application/json&srsname=' + proj + '&' +
          'bbox=' + extent.join(',') + ',' + proj;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        const onError = function () {
          vectorSource.removeLoadedExtent(extent);
        };
        xhr.onerror = onError;
        xhr.onload = function () {
          if (xhr.status == 200) {
            vectorSource.addFeatures(
              vectorSource.getFormat().readFeatures(xhr.responseText));
          } else {
            onError();
          }
        };
        xhr.send();
      },
      strategy: bboxStrategy
    });

    const vector = new VectorLayer({
      source: vectorSource,
      style: new Style({
        /*
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: 'rgba(0, 191, 255, 1.0)'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 1
          })
        })*/
        fill: new Fill({
          color: 'rgba(120, 191, 255, 0.6)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 0.8)',
          width: 2
        })
      })
    });
    // agregar capa vector al mapa
    map.addLayer(vector);
    // creo segunda capa tipo vector

    const vectorSource2 = new VectorSource({
      format: new GeoJSON(),
      loader(extent, resolution, projection) {
        const proj = projection.getCode();
        const url = 'http://elaacgresf00.enelint.global:8080/geoserver/dwh/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=dwh:vm_ultimo_dato_estacion&' +
          'outputFormat=application/json&srsname=' + proj + '&' +
          'bbox=' + extent.join(',') + ',' + proj;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        const onError = function () {
          vectorSource2.removeLoadedExtent(extent);
        };
        xhr.onerror = onError;
        xhr.onload = function () {
          if (xhr.status == 200) {
            vectorSource2.addFeatures(
              vectorSource2.getFormat().readFeatures(xhr.responseText));
          } else {
            onError();
          }
        };
        xhr.send();
      },
      strategy: bboxStrategy
    });
    // agrego la segunda fuente de datos a una capa vectorlayer
    const vector2 = new VectorLayer({
      source: vectorSource2,
      style: new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: 'rgba(0, 191, 255, 1.0)'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 1
          })
        })
      })
    });

    // agrego la capa al mapa
    map.addLayer(vector2);

    map.on('singleclick', (evt) => {

      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));

      console.log(vector.getSource().getFeaturesAtCoordinate(coordinate));

      content.innerHTML = '<p>Current coordinates are :</p><code>' + hdms +
        '</code>';
      overlay.setPosition(coordinate);
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        // you can add a condition on layer to restrict the listener
        layer = [vector, vector2];
        return feature;
      });
      if (feature) {
        // here you can add you code to display the coordinates or whatever you want to do
        console.log(feature);
        content.innerHTML = '<p>nombre :<code>' + feature.values_.nombre +
          '</code></p> <p>Area: <code>' + feature.values_.shape_area +
          '</code></p>' +
          '</code></p> <p>Nombre Estación: <code>' + feature.values_.nombre_estacion +
          '</code></p>' +
          '</code></p> <p>Nombre Sensor: <code>' + feature.values_.nombre_sensor +
          '</code>' + ' valor: ' + feature.values_.valor + ' ' + feature.values_.unidad + '</p>';
      }
    });
  }

  initializeChart() {
    this._weather.dailyData('0000016011', '2019-02-01', '2019-05-10')
      .subscribe(res => {
        const data = res.filter(res => {
          return res.id_sensor === '1230    ';
        });
        console.log(data);
        let dataset = [];
        dataset = data.map(res => {
          return {
            t: res.fecha_hora,
            y: res.valor
          }
        });
        //   const conf =  {
        //     type: 'line',
        //     data: {
        //       backgroundColor: 'red',
        //       datasets: {
        //       data: dataset}
        //     },
        //     options: {
        //         scales: {
        //             xAxes: [{
        //                 type: 'time',
        //                 time: {
        //                     unit: 'hour'
        //                 }
        //             }]
        //         }
        //     }
        // };
        const conf = {
          type: 'line',
          data: {
            datasets: [{
              label: 'Scatter Dataset',
              data: dataset
            }]
          },
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                position: 'bottom'
              }]
            }
          }
        };
        console.log(conf);
        this.chart = new Chart('canvas', conf);
      });
  }



}

