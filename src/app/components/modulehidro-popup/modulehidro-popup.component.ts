import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';
import { DatawarehouseService } from '../../services/datawarehouse.service';

@Component({
  selector: 'app-modulehidro-popup',
  templateUrl: './modulehidro-popup.component.html',
  styleUrls: ['./modulehidro-popup.component.css']
})
export class ModulehidroPopupComponent implements OnInit {

  info: any[];
  stationCompany: any;
  stationName: any;
  stationId: any;
  stationState: any;
  date: Date;

  constructor(private interaction: ComponentsInteractionService,
              private dwhService: DatawarehouseService) { }
  ngOnInit() {
    // Recibir respuesta de servicio de interacción de la capa estaciones y determinar acción
    this.interaction.popupInteraction.subscribe((popup: any) => {
      this.stationCompany = popup.nombreEntidad;
      this.stationName = popup.nombreEstacion;
      this.stationId = popup.idEstacion;
      this.stationState = popup.estadoEstacion;
      console.log('Estación seleccionada: ', this.stationId);

      // Preguntar y recibir respuesta de servicio de dwh de la estación seleccionada y determinar acción
      this.dwhService.getSensorsLastInfoByStation(this.stationId).subscribe((data: any) => {
        console.log('DATA dwh', data);
        this.info = data;
        this.date = this.info[0].fecha;
    }, (error) => {
      alert(`Error on interaction PopUp ${error.message}`);
    });

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
    }
    const collapsedItems = document.getElementsByClassName('collapseditem');
    for (let index = 0; index < collapsedItems.length; index++) {
      const element = collapsedItems[index];
      element.classList.remove('popupbodytext-selected');
      element.classList.add('popupbodytext');
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

  displayDataSensor(item: any) {
    this.interaction.setSensor(item);
  }

}
