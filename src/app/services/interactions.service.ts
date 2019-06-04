import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentsInteractionService {

  public mapInteraction: Subject<any> = new Subject();

  constructor() {}

  setLayer(layer: any, show: boolean): void {
    layer.show = show;
    this.mapInteraction.next(layer);
  }

}
