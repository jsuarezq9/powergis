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
    if (value.title) {
      return `${value.title}`;
    } else {
      let name: any[] ;
      name = value.name.split('_');
      name = name.slice(1, name.length);
      let finalName = '';
      name.forEach(element => {
        finalName += `${element} `;
      });
      return `${finalName}`;
    }
  }

}

