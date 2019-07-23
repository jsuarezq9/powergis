import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';
import * as helper from '../../../environments/helper';


@Component({
  selector: 'app-module-despacho',
  templateUrl: './module-despacho.component.html',
  styleUrls: ['./module-despacho.component.css']
})
export class ModuleDespachoComponent implements OnInit {

  layersInHidro = [];
  layersInfo = [];
  filterTechnology = [];
  filterAgente = [];
  layerDespacho: any;

  constructor(private interaction: ComponentsInteractionService) { }

  ngOnInit() {

    this.filterTechnology = helper.filterTechnology;

    this.filterAgente = helper.filterAgente;

    this.layerDespacho = {
      href: 'http://10.154.80.177:8080/geoserver/rest/workspaces/xm/layers/despacho_nacional.json',
      name: 'despacho_nacional',
      edit: false,
    };

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

  selectTech(item, agente?: any) {
    if (!agente) {
      const CQLfilter = `CQL_FILTER=tipo_gener=%27${item.name}%27&`;
      this.interaction.setFilterPlantsDespacho(CQLfilter);
    } else {
      const CQLfilter = `CQL_FILTER=id_agente=%27${item.id}%27&`;
      this.interaction.setFilterPlantsDespacho(CQLfilter);
    }
  }
}
