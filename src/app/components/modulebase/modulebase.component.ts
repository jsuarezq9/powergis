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
  layersInfo = [];
  rotation: string;

  constructor(private geoservice: GeoserverService,
              private interaction: ComponentsInteractionService) {
    forkJoin(this.getBases(), this.getTems()).subscribe((layers) => {
      // console.log('Construc');
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < layers.length; i++) {
        const element = layers[i];
        this.concatLayers(element);
      }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.layers.length; i++) {
        const element = this.layers[i];
        const source = this.getLayerTypeFromHref(element);
        element.source = source;
      }
      this.getLayersTitles(this.layers);
      // console.log(this.layers);

    }, (error) => {
      this.handleError('carga inicial de capas', error);
    });

  }

  ngOnInit() {
  }

  selectLayer(event: any): void {
    this.interaction.setLayer(event.layer, event.e.target.checked, true);
  }

  getBases() {
    return this.geoservice.getLayers(this.geoservice.BASE).toPromise();
  }

  getTems() {
    return this.geoservice.getLayers(this.geoservice.TEMS).toPromise();
  }

  getDWHS() {
    return this.geoservice.getLayers(this.geoservice.DWHS).toPromise();
  }

  getLayerTypeFromHref(layer: any): string {
    const uri = `${layer.href}`;
    if (uri.search(this.geoservice.BASE) > 0) {
      return this.geoservice.BASE;
    } else if (uri.search(this.geoservice.TEMS) > 0) {
      return this.geoservice.TEMS;
    } else if (uri.search(this.geoservice.DWHS) > 0) {
      return this.geoservice.DWHS;
    } else if (uri.search(this.geoservice.RASTERS) > 0) {
      return this.geoservice.RASTERS;
    } else {
      return null;
    }
  }

  concatLayers(layer: any[]): void {
    this.layers = this.layers.length === 0 && layer !== undefined ? layer : this.layers.concat(layer);
  }

  handleError(type, error) {
    alert(`Something went wrong while layer's request (${type}) on modulebase: ${error.message}`);
  }

  async getLayersTitles(layers: any[]) {
    const promises = [];
    // console.log(layers)
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < layers.length; i++ ) {
      promises.push(this.geoservice.getLayersName(layers[i].source, layers[i].name));
    }
    forkJoin(promises).subscribe((response: any) => {

      // console.log('Fork', response)
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < response.length; i++) {
        const element = response[i];
        if (element) {
          // console.log('****´', element.attribution.title);
          const newLayer = layers.filter(layer => element.name === layer.name)[0];
          if (newLayer && newLayer !== undefined && layers.indexOf(newLayer) > 0) {
            const j = layers.indexOf(newLayer);
            layers[j].title = element.attribution.title;
          }
        }
      }
      // this.concatLayers(layers);
      // console.log(responses.length, promises.length)
      this.interaction.setLayerTitles(layers);
    });

  }

}
