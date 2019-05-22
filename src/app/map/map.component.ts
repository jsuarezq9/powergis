import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View.js';
import {getWidth, getCenter} from 'ol/extent.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import {ImageCanvas as ImageCanvasSource, Stamen} from 'ol/source.js';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map;
  constructor() { }

  ngOnInit() {
  }
  initializeMap() {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new Stamen({
            layer: 'watercolor'
          })
        })
      ],
      target: 'map',
      view: new View({
        center: fromLonLat([-97, 38]),
        zoom: 4
      })
    });

  }
}
