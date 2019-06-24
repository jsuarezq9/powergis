import { MapComponent } from './../map/map.component';
import { Component, OnInit } from '@angular/core';
import { DatawarehouseService } from '../../services/datawarehouse.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
import TileWMS from 'ol/source/TileWMS.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Stroke, Circle, Fill, Text } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy, all } from 'ol/loadingstrategy.js';
import Feature from 'ol/Feature';
import * as jsonPath from 'jsonpath/jsonpath';
import * as moment from 'moment';


@Component({
  selector: 'app-moduleprecipitation',
  templateUrl: './moduleprecipitation.component.html',
  styleUrls: ['./moduleprecipitation.component.css']
})
export class ModuleprecipitationComponent implements OnInit {


  coordinatesColombia = [-74, 4];
  coordinatesEmgesa = [-76, 3.5];
  coordinatesQuimbo = [-76, 3.5];
  coordinatesBetania = [-76, 3.5];
  coordinatesRioBogota = [-76, 3.5];
  coordinatesGuavio = [-76, 3.5];
  zoomColombia = 6;
  zoomEmgesa = 8;
  zoomQuimbo = 10;
  zoomBetania = 10;
  zoomRioBogota = 10;
  zoomGuavio = 10;
  rasters = ['PT_LAST_01H', 'PT_LAST_02H', 'PT_LAST_03H', 'PT_LAST_06H', 'PT_LAST_12H', 'PT_LAST_24H', 'PT_LAST_03D',
   'PT_LAST_14D',
   'PT_LAST_30D',
   'PT_LAST_60D'
  ];
  precipitation = {};
  precipitationLayer: VectorLayer;


  constructor(private dwhService: DatawarehouseService,
              private interaction: ComponentsInteractionService) { }

  ngOnInit() {
    this.getAggregatedData('2019-05-06 00:00', '2019-06-17 23:00');
  }

  viewColombia() {
    this.removeActive();
    document.getElementById('viewColombia').classList.add('active');
    this.interaction.setView(this.coordinatesColombia, this.zoomColombia);
  }
  viewEmgesa() {
    this.removeActive();
    document.getElementById('viewEmgesa').classList.add('active');
    this.interaction.setView(this.coordinatesEmgesa, this.zoomEmgesa);
  }
  viewQuimbo() {
    this.removeActive();
    document.getElementById('viewQuimbo').classList.add('active');
    this.interaction.setView(this.coordinatesQuimbo, this.zoomQuimbo);
  }
  viewBetania() {
    this.removeActive();
    document.getElementById('viewBetania').classList.add('active');
    this.interaction.setView(this.coordinatesBetania, this.zoomBetania);
  }
  viewRioBogota() {
    this.removeActive();
    document.getElementById('viewRioBogota').classList.add('active');
    this.interaction.setView(this.coordinatesRioBogota, this.zoomRioBogota);
  }
  viewGuavio() {
    this.removeActive();
    document.getElementById('viewGuavio').classList.add('active');
    this.interaction.setView(this.coordinatesGuavio, this.zoomGuavio);
  }

  removeActive() {
    const array = document.getElementsByClassName('dropdown-item pointer active');
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < array.length; index++ ) {
      const element = array[index];
      element.classList.remove('active');
    }
  }
  getAggregatedData(fechaInicio, fechaFin) {
    this.dwhService.getAggregatedPrecipitation(fechaInicio, fechaFin)
      .subscribe((data) => {
        this.precipitation = { data };
        console.log(this.precipitation);
        this.addPrecipitationLayer();
        },
        (error) => console.log(error)
      );
  }
  addRaster(raster ) {
    const rasterArray = raster.split('_');
    const deltaDate = rasterArray[2];
    const deltaDateTime = deltaDate.substring( deltaDate.length - 1, deltaDate.length).toLowerCase();
    const deltaDatePeriod = deltaDate.substring( 0, deltaDate.length - 1);

    const rasterLayer = new TileLayer({
      source: new TileWMS({
        url: 'http://elaacgresf00.enelint.global:8080/geoserver/raster/wms',
        params: {LAYERS: 'raster:' + raster, TILED: true},
        serverType: 'geoserver',
        // Countries have transparency, so do not fade tiles:
        transition: 1
      }),
      name: raster
    });
    console.log(rasterLayer);
    const now = moment().format('YYYY-MM-DD hh:mm');
    const fechaInicio = moment().subtract(deltaDatePeriod, deltaDateTime).format('YYYY-MM-DD hh:mm');
    this.getAggregatedData(fechaInicio, now);
    //MapComponent.saveLayer('raster', rasterLayer);
  }
  addPrecipitationLayer() {
    const vectorSource2 = new VectorSource({
      format: new GeoJSON(),
      loader(extent, resolution, projection) {
        const proj = projection.getCode();
        const url = 'http://elaacgresf00.enelint.global:8080/geoserver/dwh/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=dwh:vm_ultimo_dato_estacion&' +
          'CQL_FILTER=id_sensor=%270240%27&' +
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
    console.log(vectorSource2);
    const setStyle = (feature) => {
      if (jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + feature.get('id_estacion') + '" )]')[0]) {
        try {
          const color_rgb = jsonPath.query(this.precipitation, '$.data[?(@.id_estacion=="' + feature.get('id_estacion') + '" )]')[0].color_rgb;
          const colorarray = color_rgb.split(',');
          const colorR = colorarray[0];
          const colorG = colorarray[1];
          const colorB = colorarray[2];

          const styles = {
            Default: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({ color: 'rgba(' + colorR + ',' + colorG + ',' + colorB + ', 0.8)' }),
                stroke: new Stroke({ color: 'rgba(0, 0, 255, 0.8)', width: 2 })
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
        return style.Default

      }
      this.precipitationLayer = new VectorLayer({
        source: vectorSource2,
        renderMode: 'vector',
        style: setStyle
      });
      console.log('hi');
      console.log(this.precipitationLayer);
     // MapComponent.map.addLayer(this.precipitationLayer);
    };
  }









}
