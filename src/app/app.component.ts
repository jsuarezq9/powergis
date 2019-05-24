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
import { Tile as TileLayer, Vector as VectorLayer, } from 'ol/layer';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate.js';
import { toLonLat } from 'ol/proj.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import wfs from 'ol/source';
import * as ol from 'openlayers';
import { defaults, Control, ZoomSlider, OverviewMap, Zoom } from 'ol/control';
import { Select } from 'ol/interaction';
import { events } from 'ol/events';

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
        }
        xhr.onerror = onError;
        xhr.onload = function () {
          if (xhr.status == 200) {
            vectorSource.addFeatures(
              vectorSource.getFormat().readFeatures(xhr.responseText));
          } else {
            onError();
          }
        }
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
          color: 'rgba(0, 191, 255, 0.9)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 1.0)',
          width: 2
        })
      })
    });
    /*const vector = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 1.0)',
          width: 2
        })
      })
    });*/

    const base = new TileLayer({
      source: new TileJSON({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });

    const map = new Map({
      // controls: [new Zoom(), new ZoomSlider(),
      //   new OverviewMap()
      // ],
      layers: [
        base, vector
      ],
      overlays: [overlay],
      target: 'map',
      view: new View({
        center: fromLonLat([-74.063644, 4.624335]),
        zoom: 7
      })
    });

    /*const hoverInteraction = new Select({
      condition: events().condition.pointerMove,
      layers: [vector]  //Setting layers to be hovered
    });
    map.addInteraction(hoverInteraction);*/


    // pointermove


    map.on('singleclick', function (evt) {

      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));

      console.log(vector.getSource().getFeaturesAtCoordinate(coordinate));
      content.innerHTML = '<p>Current coordinates are :</p><code>' + hdms +
        '</code>';
      overlay.setPosition(coordinate);
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        // you can add a condition on layer to restrict the listener
        layer = vector;
        return feature;
      });
      if (feature) {
        // here you can add you code to display the coordinates or whatever you want to do
        console.log(feature);
        content.innerHTML = '<p>nombre :<code>' + feature.values_.nombre +
          '</code></p> <p>Area: <code>' + feature.values_.shape_area +
          '</code></p>';
      }

      /*const startMarker = new Feature({
        geometry: new Point(coordinate),
      });
      this.vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [startMarker]
        }),
        style: new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({
              color: 'black'
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 255, 1.0)',
              width: 1
            })
          })
        })
      });

     // this.addLayer(this.vectorLayer);*/

    });
  }
}
