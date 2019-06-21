import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GeoserverService } from '../../services/geoserver.service';
import { ComponentsInteractionService } from '../../services/interactions.service';
import { toStringHDMS } from 'ol/coordinate.js';
import { forkJoin } from 'rxjs';

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
  }

  ngOnInit() {
  }

  selectLayer(event: any): void {
    this.interaction.setLayer(event.layer, event.e.target.checked, true);
  }

  async getBases() {
    this.geoservice.getLayers(this.geoservice.BASE).subscribe((bases: any) => {
      this.getLayersTitles(bases, this.geoservice.BASE);
    }, (error) => {
      this.handleError(this.geoservice.BASE, error);
    });
  }

  getTems() {
    const source = this.geoservice.TEMS;
    this.geoservice.getLayers(this.geoservice.TEMS).subscribe(async (tems: any) => {
      this.getLayersTitles(tems, source);
    }, (error) => {
      this.handleError(this.geoservice.TEMS, error);
    });
  }

  getDWHS() {
    const source = this.geoservice.DWHS;
    this.geoservice.getLayers(this.geoservice.DWHS).subscribe(async (dwhs: any) => {
      this.getLayersTitles(dwhs, source);
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

  async getLayersTitles(layers: any[], source: string) {
    const promises = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < layers.length; i++ ) {
      promises.push(this.geoservice.getLayersName(source, layers[i].name));
    }
    forkJoin(promises).subscribe((responses: any) => {
      console.log('FORK\n', responses);
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responses.length; i++) {
        const element = responses[i];
        if (element) {
          console.log('****´', element.attribution.title);
          const newLayer = layers.filter(layer => element.name === layer.name)[0];
          if (newLayer && newLayer !== undefined && layers.indexOf(newLayer) > 0) {
            const j = layers.indexOf(newLayer);
            layers[j].title = element.attribution.title;
          }
        }
      }
      this.concatLayers(layers);
    });

  }

}
