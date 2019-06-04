import { Pipe, PipeTransform } from '@angular/core';
import { GeoserverService } from '../services/geoserver.service';

@Pipe({
  name: 'layerName'
})
export class LayerNamePipe implements PipeTransform {

  DWH = 'dwh';
  BASE = 'base';
  TEMS = 'tem';

  transform(value: any, args?: any): any {
    let name: any[] ;
    name = value.name.split('_');
    name = name.slice(1, name.length);
    const type = this.getLayerTypeFromHref(value.href);
    return `${name.join(' ')} (${type})`;
  }

  getLayerTypeFromHref(layer: any): string {
    const uri = `${layer}`;
    if (uri.search(this.BASE) > 0) {
      return this.BASE;
    } else if (uri.search(this.TEMS) > 0) {
      return this.TEMS;
    } else if (uri.search(this.DWH)) {
      return this.DWH;
    } else {
      return null;
    }
  }

}

