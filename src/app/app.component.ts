import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj.js';
import { Tile as TileLayer, Vector as VectorLayer, } from 'ol/layer';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import Select from 'ol/interaction/Select.js';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Stroke, Circle, Fill, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy, all } from 'ol/loadingstrategy.js';
import { TimeSeriesService } from './timeseries.service';
import Chart from 'chart.js/dist/Chart.js';
import Feature from 'ol/Feature';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
import { style } from 'openlayers';
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
    const hooverContainer = document.getElementById('popup-hoover');
    const now = moment();
    now.format('YYYY-MM-DD hh:mm:ss');


    const overlay = new Overlay({
      element: container,
      autoPan: false,
      autoPanAnimation: {
        duration: 250
      }
    });
    const hoover = new Overlay({
      element: hooverContainer,
      autoPan: false,
      autoPanAnimation: {
        duration: 250
      }
    });
    closer.onclick = () => {
      overlay.setPosition(undefined);
      this.features = [];
      this.info = [];
      closer.blur();
      return false;
    };
    const base = new TileLayer({
      source: new OSM()
    });
    const map = new Map({
      layers: [base],
      overlays: [overlay, hoover],
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
          'CQL_FILTER=id_sensor%20not%20ilike%20%271%25%27%20and%20id_sensor%3C%3E%279000%27&' +
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

    const styles = {
      hidroEmgesaActiva: new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaEmgesa.png', scale: 0.25 }) }),
      hidroEmgesaInactiva: new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaEmgesaInactiva.png', scale: 0.25 }) }),
      hidroActiva: new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaOtros.png', scale: 0.25 }) }),
      hidroInactiva: new Style({ image: new Icon({ src: 'assets/IconoEstacionHidrologicaInactiva.png' , scale: 0.25 }) }),
      Default: new Style({
        image: new Circle({
          radius: 4, fill: new Fill({ color: 'rgba(120, 191, 255, 0.6)', }),
          stroke: new Stroke({ color: 'rgba(0, 0, 255, 0.8)', width: 2 })
        })
      })
    };



    const setStyle = (feature) => {
      if (feature.get('nombre_entidad') === 'EMGESA') {
        if (moment(feature.get('fecha_hora'), 'YYYY-MM-DD hh:mm:ss') < now.subtract(1, 'hours')) {
          return styles.hidroEmgesaInactiva;
        } else {

          return styles.hidroEmgesaActiva;
        }
      } else {
        if (moment(feature.get('fecha_hora'), 'YYYY-MM-DD hh:mm:ss') < now.subtract(1, 'hours')) {
          return styles.hidroInactiva;
        } else {
          console.log('hi cambio')
          return styles.hidroActiva;
        }
      }
    };





    // agrego la segunda fuente de datos a una capa vectorlayer
    const vector2 = new VectorLayer({
      source: vectorSource2,
      renderMode: 'vector',
      style: setStyle
    });

    // agrego la capa al mapa
    map.addLayer(vector2);

    const selectPointerMove = new Select({
      condition: pointerMove,
      layer: [vector2]
    });

    map.addInteraction(selectPointerMove);
    map.on('singleclick', evt => {
      this.features = [];
      this.info = [];
      const coordinate = evt.coordinate;
      overlay.setPosition(coordinate);
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
            this.info.push({
            sensor: feature.get('id_sensor'),
            estacion: feature.get('nombre_estacion'),
            fecha: new Date(feature.values_.fecha_hora).toLocaleString('es-CO'),
            valor: feature.get('valor'),
            idestacion: feature.get('id_estacion')
          });

      }, {
          layerFiltter: (layer) => {
          return layer.get('layer_name') === 'vector2';
        }

      });
    });

    let feature_onHover = Feature;
    map.on('pointermove', (evt) => {
      feature_onHover = map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {

        return feature;
      });
      if (feature_onHover) {
        hoover.setPosition(evt.coordinate);
        if (feature_onHover.get('nombre')) {
          hooverContainer.innerHTML = feature_onHover.getProperties().nombre;
          hooverContainer.style.display = 'block';
        } else if (feature_onHover.get('nombre_estacion')) {
          hooverContainer.innerHTML = feature_onHover.get('nombre_estacion');
          hooverContainer.style.display = 'block';
        }

      } else {
        hooverContainer.style.display = 'none';
      }
    });
  }
  initializeChart(estacion, sensor) {
    this._timeseries.rawData(estacion, '2019-02-01', '2019-06-05', sensor)
      .subscribe(res => {
        const data = res;
        const dataset = [];
        data.map(element => {
          dataset.push(
            {
              t: element.fecha_hora,
              y: element.valor.toFixed(3)
            });
        });
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
        this.chart = new Chart('canvas', conf);
      });
  }
}
