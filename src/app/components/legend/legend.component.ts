import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';

import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';


@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  @Output() legendSelected = new EventEmitter();
  // Leyenda
  layersInLegend = [];
  layersInfo = [];

  constructor(private interaction: ComponentsInteractionService) { }

  ngOnInit() {
    // Información con título desde map
    this.interaction.layerTitlesPlusGeometryInteraction.subscribe(( layersArray: any ) => {
      console.log('llegando a LEGEND', layersArray);
      this.layersInfo = layersArray;
    });

    // Cada vez que se edite una capa en módulo 1
    this.interaction.mapInteraction.subscribe(( layer: any ) => {

      // Agrego al arreglo si show=true
      if (layer.show) {
        this.layersInLegend.push(this.layersInfo[layer.name]);
      } else {
        const index = this.layersInLegend.indexOf(this.layersInfo[layer.name], 0);
        if (index > -1) {
          this.layersInLegend.splice(index, 1);
        }
      }

      // Expando la leyenda si es la primera capa
      if (this.layersInLegend.length === 1) {
        this.select(undefined);
      }

      this.getLegend();
      console.log('LEGENDCOMP', this.layersInLegend);

      // Consulto el tipo de geometría de la nueva capa
      // this.requestLayerWFS();
    });

    this.getLegend();
  }

  select(event) {
    this.legendSelected.emit(event);
  }

  getLegend() {
    if (this.layersInLegend.length === 0) {
      // ESCONDER LEYENDA
      document.getElementById('buttonCollapseLegendDiv').style.display = 'none';
    } else {
      // MOSTRAR LEYENDA
      document.getElementById('buttonCollapseLegendDiv').style.display = 'flex';
    }
  }

}
