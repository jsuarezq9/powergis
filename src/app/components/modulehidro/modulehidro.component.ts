import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';
import * as helper from '../../../environments/helper';

@Component({
  selector: 'app-modulehidro',
  templateUrl: './modulehidro.component.html',
  styleUrls: ['./modulehidro.component.css'],
})
export class ModulehidroComponent implements OnInit {

  layersInHidro = [];
  layersInfo = [];
  filterClass = [];
  filterEntidad = [];

  constructor(private interaction: ComponentsInteractionService) { }

  ngOnInit() {

    this.filterClass = helper.filterClass;
    this.filterEntidad = helper.filterEntidad;
    // Información con título desde map
    this.interaction.layerTitlesPlusGeometryInteraction.subscribe(( layersArray: any ) => {
      this.layersInfo = layersArray;
    });

    // Cada vez que se edite una capa en módulo 1
    this.interaction.mapInteraction.subscribe(( layer: any ) => {
      // Agrego al arreglo si show=true
      if (layer.show) {
        this.layersInHidro.push(this.layersInfo[layer.name]);
      } else {
        const index = this.layersInHidro.indexOf(this.layersInfo[layer.name], 0);
        if (index > -1) {
          this.layersInHidro.splice(index, 1);
        }
      }
      // Consulto el tipo de geometría de la nueva capa
      // this.requestLayerWFS();
    });
    // Eliminando desde el botón limpiar la ayuda del menu desplegable
    this.interaction.setActiveBaseLayers.subscribe((layer: any) => {
      this.layersInHidro = [];
    });
  }


  selectTech(item: any, agente?: any) {
    if (!agente) {
      const CQLfilter = `CQL_FILTER=nombre_entidad=%27${item.name}%27&`;
      this.interaction.setFilterEstaciones(CQLfilter);
    } else {
      const CQLfilter = `CQL_FILTER=nombre_clase=%27${item.name}%27&`;
      this.interaction.setFilterEstaciones(CQLfilter);
    }
  }

}
