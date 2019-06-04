import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj.js';
import { Tile as TileLayer, Vector as VectorLayer, } from 'ol/layer';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import Select from 'ol/interaction/Select.js';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate.js';
import { toLonLat } from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy, all } from 'ol/loadingstrategy.js';
import { TimeSeriesService } from './timeseries.service';
import Chart from 'chart.js/dist/Chart.js';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'PowerGIS';
  options = {};
  width = 550;
  height = 400;
  chart = [];
  features = [];
  info = [];
  columns = ['Sensor', 'Estación', 'Fecha', 'valor'];

  constructor(private _timeseries: TimeSeriesService) { }

  ngOnInit() {
    this.initilizeMap();
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
    closer.onclick = function() {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };
    const base = new TileLayer({
      source: new OSM()
    });
    const map = new Map({
      // controls: [new Zoom(), new ZoomSlider(),
      //   new OverviewMap()
      // ],
      layers: [base],
      overlays: [overlay],
      target: 'map',
      view: new View({
        center: fromLonLat([-74.063644, 3.924335]),
        zoom: 7
      })
    });

    const vectorSource = new VectorSource({
      format: new GeoJSON({
        defaultDataProjection: 'EPSG:4686'
      }),
      loader(extent, resolution, projection) {
        const proj = projection.getCode();
        const url = 'http://elaacgresf00.enelint.global:8080/geoserver/tem/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=tem:c020101_sin&' +
          'outputFormat=application/json&srsname=' + proj + '&' +
          'bbox=' + extent.join(',') + ',' + proj;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        const onError = () => {
          vectorSource.removeLoadedExtent(extent);
        };
        xhr.onerror = onError;
        xhr.onload = () => {
          if (xhr.status === 200) {
            vectorSource.addFeatures(
              vectorSource.getFormat().readFeatures(xhr.responseText, {
                featureProjection: projection
              }));
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
          'CQL_FILTER=id_sensor%20not%20ilike%20%271%25%27%20and%20id_sensor%3C%3E%279000%27&'+
          'outputFormat=application/json&srsname=' + proj;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        const onError = () => {
          vectorSource2.removeLoadedExtent(extent);
        };
        xhr.onerror = onError;
        xhr.onload = () => {

          if (xhr.status === 200) {
            vectorSource2.addFeatures(
              vectorSource2.getFormat().readFeatures(xhr.responseText, {
                featureProjection: projection
              }));
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
          radius: 5,
          fill: new Fill({
            color: 'rgba(0, 191, 255, 1.0)'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 1
          })
        })
      }),
      renderMode: 'vector'
    });
    // agrego la capa al mapa
    map.addLayer(vector2);
    let select;
    const selectPointerMove = new Select({
      condition: pointerMove,
      layer: vector2
    });
    select = selectPointerMove;

    map.addInteraction(select);
    map.on('singleclick', (evt) => {
      //  content.innerHTML= '';
      this.features = [];
      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));
      overlay.setPosition(coordinate);
      this.info = [];
      map.forEachFeatureAtPixel(evt.pixel, feature => {
        this.info.push({
          sensor: feature.values_.id_sensor,
          estacion: feature.values_.nombre_estacion,
          fecha: feature.values_.fecha_hora,
          valor: feature.values_.valor.toFixed(2),
          idestacion: feature.values_.id_estacion
        });
      });
    });
  }

  initializeChart(estacion, sensor) {
  console.log('hi estacion:' + estacion + ' sensor:' + sensor);
  this._timeseries.rawData(estacion, '2018-02-01', '2019-05-10', sensor)
    .subscribe(res => {
      const data = res;
      console.log(data);
      let dataset = [];
      dataset = data.map(res => {
        return {
          t: res.fecha_hora,
          y: res.valor.toFixed(3)
        };
      });
      console.log(dataset);
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
