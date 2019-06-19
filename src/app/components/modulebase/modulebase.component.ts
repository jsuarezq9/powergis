import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
import { toStringHDMS } from 'ol/coordinate.js';

@Component({
  selector: 'app-modulebase',
  templateUrl: './modulebase.component.html',
  styleUrls: ['./modulebase.component.css']
})
export class ModulebaseComponent implements OnInit {

  @Output() collapsedModule = new EventEmitter();

  layers = [];
  rotation: string;

  constructor(private geoservice: GeoserverService,
              private interaction: ComponentsInteractionService) {
    this.getBases();
    this.getTems();
    this.getDWHS();
    this.getNames();
  }

  ngOnInit() {
  }

  selectLayer(event: any): void {
    this.interaction.setLayer(event.layer, event.e.target.checked, true);
  }

  getBases() {
    this.geoservice.getLayers(this.geoservice.BASE).subscribe((bases: any) => {
      this.concatLayers(bases);
    }, (error) => {
      this.handleError(this.geoservice.BASE, error);
    });
  }

  getTems() {
    this.geoservice.getLayers(this.geoservice.TEMS).subscribe((tems: any) => {
      this.concatLayers(tems);
    }, (error) => {
      this.handleError(this.geoservice.TEMS, error);
    });
  }

  getDWHS() {
    this.geoservice.getLayers(this.geoservice.DWHS).subscribe((dwhs) => {
      this.concatLayers(dwhs);
    }, (error) => {
      this.handleError(this.geoservice.DWHS, error);
    });
  }

  concatLayers(layer: any[]): void {
    this.layers = this.layers.length === 0 && layer !== undefined ? layer : this.layers.concat(layer);
  }

  handleError(type, error) {
    alert(`Something went wrong while layer's request (${type}) on modulebase: ${error.message}`);
  }

  getNames() {
    console.log('getnames', this.layers)
  }


}
