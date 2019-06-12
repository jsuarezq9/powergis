import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';

@Component({
  selector: 'app-modulehidro-popup',
  templateUrl: './modulehidro-popup.component.html',
  styleUrls: ['./modulehidro-popup.component.css']
})
export class ModulehidroPopupComponent implements OnInit {

  info: any;
  company: any;
  stationName: any;
  stationId: any;
  date: Date;

  constructor(private interaction: ComponentsInteractionService) { }
  ngOnInit() {
    // Recibir respuesta de servicio de interacción y determinar acción
    this.interaction.popupInteraction.subscribe((popup: any) => {
      if (popup.length > 0) {
        const array = [];
        this.company = popup[0].nombreEntidad;
        this.stationName = popup[0].nombreEstacion;
        this.stationId = popup[0].idEstacion;
        this.date = popup[0].fecha;
        let estacion: string;
        estacion = popup[0].idEstacion;
        console.log('Estación seleccionada: ', estacion);
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < popup.length; index++) {
          const item = popup[index];
          if (item.idEstacion === estacion) {
            const rep = array.filter(feature => feature.idSensor === item.idSensor);
            if (rep.length === 0) {
              array.push(item);
            }
          }
        }
        this.info = array;
        console.log('This info', array);
      } else {
        this.info = [];
        console.log('No information granted for this pop up info:', this.info);
      }
    }, (error) => {
      alert(`Error on interaction PopUp ${error.message}`);
    });
  }

  getBigPopup() {

    // Escondo el popup
    const popup = document.getElementById('myPopup');
    popup.classList.remove('show');

    // Muestro el popupExpanded
    const popupExpanded = document.getElementById('myPopupExpandedContainer');
    popupExpanded.style.display = 'flex';
    const popupModule = document.getElementById('moduleHidroPopup');
    popupModule.style.display = 'block';
  }

  closeBigPopup() {
    // Escondo el popupExpanded y el popupModule
    const popupExpanded = document.getElementById('myPopupExpandedContainer');
    popupExpanded.style.display = 'none';
    const popupModule = document.getElementById('moduleHidroPopup');
    popupModule.style.display = 'none';
  }

  changeSelection(event: any) {

    // Reinicio selección en popup y popup expanded
    const expandedItems = document.getElementsByClassName('expandeditem');
    for (let index = 0; index < expandedItems.length; index++) {
      const element = expandedItems[index];
      element.classList.remove('popupbodytext-selected');
      element.classList.add('popupbodytext');
      console.log('1. Arreglo items de popup expanded:', index, element);
    }
    const collapsedItems = document.getElementsByClassName('collapseditem');
    for (let index = 0; index < collapsedItems.length; index++) {
      const element = collapsedItems[index];
      element.classList.remove('popupbodytext-selected');
      element.classList.add('popupbodytext');
      console.log('1. Arreglo items de popup collapsed:', index, element);
    }

    // Asigno clase selección según de dónde provenga selección (popup o popupExpanded)
    const id = event.path[1].id;
    const selection = document.getElementById(id);
    selection.classList.add('popupbodytext-selected');
    selection.classList.remove('popupbodytext');

    if (id.indexOf('expanded') >= 0) {
      const selectionCollapsed = document.getElementById(`${id.split('-', 1)[0]}`);
      selectionCollapsed.classList.add('popupbodytext-selected');
      selectionCollapsed.classList.remove('popupbodytext');
    } else {
      const selectionExpanded = document.getElementById(`${id}-expanded`);
      selectionExpanded.classList.add('popupbodytext-selected');
      selectionExpanded.classList.remove('popupbodytext');
    }
  }

}
