import { Component } from '@angular/core';
import { latLng, tileLayer } from 'leaflet';
import { not } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // Booleanos para mostrar o no módulos
  moduleBases: boolean;
  moduleHidrology: boolean;
  modulePrecipitation: boolean;

  // Booleanos del estado de los botones de colapsar de cada módulo
  // collapseBases: boolean;
  // collapseHidrology: boolean;
  // collapsePrecipitation: boolean;
  moduleMemory: string;
  collapseSidemenu = false;
  BUTTON_COLLAPSE_ID = 'buttonCollapse';
  BUTTON_COLLAPSE_DIV_ID = 'buttonCollapseDiv';

  // Ids presentes en el html de sidebar en cada boton
  BUTTON_BASES_ID = 'buttonBases';
  BUTTON_HIDROLOGY_ID = 'buttonHidrology';
  BUTTON_PRECIPITATION_ID = 'buttonPrecipitation';

  // Ids presentes en el html de cada uno de los modulos
  MODULE_BASES_ID = 'moduleBases';
  MODULE_HIDROLOGY_ID = 'moduleHidrology';
  MODULE_PRECIPITATION_ID = 'modulePrecipitation';

  MODULES_SHOW = 'block';
  MODULES_HIDE = 'none';

  constructor() {
    this.resetModules();
    console.log('collapseSidemenu', this.collapseSidemenu);
  }

  resetModules(): void {
    if (this.moduleBases) {
      this.moduleMemory = this.MODULE_BASES_ID;
    } else if (this.moduleHidrology) {
      this.moduleMemory = this.MODULE_HIDROLOGY_ID;
    } else if (this.modulePrecipitation) {
      this.moduleMemory = this.MODULE_PRECIPITATION_ID;
    }
    this.moduleBases = false;
    this.moduleHidrology = false;
    this.modulePrecipitation = false;
  }

  rotateCollapseButton(): void {
    let active = !this.collapseSidemenu ? 'rotate-180' : 'rotate-0';
    let notActive = this.collapseSidemenu ? 'rotate-180' : 'rotate-0';
    let button = document.getElementById('arrow');
    button.classList.add(active);
    button.classList.remove(notActive);
  }

  showCollapseButton(): void {
    document.getElementById(this.BUTTON_COLLAPSE_DIV_ID).style.display = this.MODULES_SHOW;
  }

  getState(show: any): void {
    console.log(show);
    if (show === this.BUTTON_BASES_ID || show === this.BUTTON_HIDROLOGY_ID || show === this.BUTTON_PRECIPITATION_ID) {
      // Viene de los botones
      this.resetModules();
      this.collapseSidemenu = true;
      this.showCollapseButton();
      console.log('collapseSidemenu por botones', this.collapseSidemenu);

      this.getStateFromButtons(show);

    } else {
      // Viene de botón colapsar
      this.resetModules();
      this.collapseSidemenu = !this.collapseSidemenu;
      this.rotateCollapseButton();
      console.log('collapseSidemenu por botón collapse', this.collapseSidemenu);

      this.getStateFromCollapseButton(show);

      // Falta: viene de hamburguesa.

    }
    this.changeState();
  }

  getStateFromButtons(show: any): void {
    if (show === this.BUTTON_BASES_ID) {
      this.moduleBases = !this.moduleBases;
    } else if (show === this.BUTTON_HIDROLOGY_ID) {
      this.moduleHidrology = !this.moduleHidrology;
    } else if (show === this.BUTTON_PRECIPITATION_ID) {
      this.modulePrecipitation = !this.modulePrecipitation;
    }
  }

  getStateFromCollapseButton(show: any): void {
    // Para cambiarle el estilo display:none block
    // console.log(show.target.offsetParent.id); //buttonCollapseDiv
    // Para cambiarle la clase button-collapse-expanded a collapsed
    // console.log(show.target.offsetParent.firstElementChild.id); //buttonCollapse
    // console.log('---------------------------');

    if (this.collapseSidemenu) {
      if (this.moduleMemory === this.MODULE_BASES_ID) {
        this.moduleBases = !this.moduleBases;
      } else if (this.moduleMemory === this.MODULE_HIDROLOGY_ID) {
        this.moduleHidrology = !this.moduleHidrology;
      } else if (this.moduleMemory === this.MODULE_PRECIPITATION_ID) {
        this.modulePrecipitation = !this.modulePrecipitation;
      }
    }
  }

  changeState(): void {
    if (this.moduleBases) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_SHOW;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
    } else if (this.moduleHidrology) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_SHOW;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
    } else if (this.modulePrecipitation) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_SHOW;
    } else {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
    }
  }

}
