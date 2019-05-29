import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'layerName'
})
export class LayerNamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let name = value.split('_');
    name = name[2] && (name[2] !== '' || name[2] !== undefined) ? `${name[1]} ${name[2]}` : name[1];
    return name;
  }

}

