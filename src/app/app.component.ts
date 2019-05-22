import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import Feature from 'ol/Feature';
import sVector from 'ol/source/Vector';
import lVector from 'ol/layer/Vector';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import {Icon, Style, Stroke, Circle, Fill} from 'ol/style';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate.js';
import { toLonLat } from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import wfs from 'ol/source';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'OpenLayers-Angular';
    constructor() { }

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
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: function(extent) {
        return 'http://elaacgresf00.enelint.global:8080/geoserver/tem/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=tem:c020208_con_informacion&' +
            'outputFormat=application/json&srsname=EPSG:4686&' +
            'bbox=' + extent.join(',') + ',EPSG:4686';
      },
      strategy: bboxStrategy
    });

    const vector = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: 'black'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
          })
        })
      })
    });
    const base = new TileLayer({
      source: new TileJSON({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });



    const map = new Map({
        layers: [
          base, vector
        ],
        overlays: [overlay],
        target: 'map',
        view: new View({
          center: [-73.965706, 5.136566],
          zoom: 3
        })
      });
    // pointermove
    map.on('singleclick', function(evt) {
      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));

      content.innerHTML = '<p>Current coordinates are :</p><code>' + hdms +
        '</code>';
      overlay.setPosition(coordinate);
    });
  }
}
