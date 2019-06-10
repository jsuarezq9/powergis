import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentsInteractionService {

  public mapInteraction: Subject<any> = new Subject();
  public popupInteraction: Subject<any> = new Subject();
  public tooltipInteraction: Subject<any> = new Subject();

  constructor() {}

  setLayer(layer: any, show: boolean, edit: boolean): void {
    layer.show = show;
    layer.edit = edit;
    this.mapInteraction.next(layer);
  }

  setPopup(info: any, show: boolean): void {
    const popover = {
      info,
      show
    };
    this.popupInteraction.next(popover);
  }

  setTooltip(info: any): void {
    const tooltip = {
      info
    };
    this.tooltipInteraction.next(tooltip);
  }

}
