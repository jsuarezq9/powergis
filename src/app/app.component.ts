import { Component } from '@angular/core';

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
  moduleDespacho: boolean;

  // Booleanos del estado de los botones de colapsar de cada módulo
  moduleMemory = '';
  expandSidebar = false;
  expandSidemenu = false;
  BUTTON_COLLAPSE_ID = 'buttonCollapse';
  BUTTON_COLLAPSE_DIV_ID = 'buttonCollapseDiv';
  BUTTON_COLLAPSE_LEGEND_DIV_ID = 'buttonCollapseLegendDiv';

  // Ids presentes en el html de sidebar en cada boton
  BUTTON_BASES_ID = 'buttonBases';
  BUTTON_HIDROLOGY_ID = 'buttonHidrology';
  BUTTON_PRECIPITATION_ID = 'buttonPrecipitation';
  BUTTON_DESPACHO_ID = 'buttonDespacho';

  // Ids presentes en el html de cada uno de los modulos
  MODULE_BASES_ID = 'moduleBases';
  MODULE_HIDROLOGY_ID = 'moduleHidrology';
  MODULE_PRECIPITATION_ID = 'modulePrecipitation';
  MODULE_DESPACHO_ID = 'moduleDespacho';

  MODULES_SHOW = 'block';
  MODULES_HIDE = 'none';

  // Leyenda

  constructor() {
    this.resetModules();

  }


  resetModules(): void {
    if (this.moduleBases) {
      this.moduleMemory = this.MODULE_BASES_ID;
    } else if (this.moduleHidrology) {
      this.moduleMemory = this.MODULE_HIDROLOGY_ID;
    } else if (this.modulePrecipitation) {
      this.moduleMemory = this.MODULE_PRECIPITATION_ID;
    } else if (this.moduleDespacho) {
      this.moduleMemory = this.MODULE_DESPACHO_ID;
    }
    this.moduleBases = false;
    this.moduleHidrology = false;
    this.modulePrecipitation = false;
    this.moduleDespacho = false;
  }

  rotateCollapseButton(): void {
    // Asigno clases de rotación del botón en el ícono
    const activeRotationIcon = this.expandSidemenu ? 'rotate-0' : 'rotate-180';
    const notActiveRotationIcon = !this.expandSidemenu ? 'rotate-0' : 'rotate-180';
    const activePositionIcon = this.expandSidemenu ? 'img-collapse-expanded' : 'img-collapse-collapsed';
    const notActivePositionIcon = !this.expandSidemenu ? 'img-collapse-expanded' : 'img-collapse-collapsed';
    const icon = document.getElementById('arrow');
    icon.classList.add(activeRotationIcon);
    icon.classList.add(activePositionIcon);
    icon.classList.remove(notActiveRotationIcon);
    icon.classList.remove(notActivePositionIcon);

  }

  showCollapseButton(): void {
    document.getElementById(this.BUTTON_COLLAPSE_DIV_ID).style.display = this.MODULES_SHOW;
    document.getElementById(this.BUTTON_COLLAPSE_LEGEND_DIV_ID).style.visibility = 'visible';
  }

  hideCollapseButton(): void {
    document.getElementById(this.BUTTON_COLLAPSE_DIV_ID).style.display = this.MODULES_HIDE;
    document.getElementById(this.BUTTON_COLLAPSE_LEGEND_DIV_ID).style.visibility = 'hidden';
  }

  getState(show: any): void {
    // Si viene de los botones
    // tslint:disable-next-line:max-line-length
    if (show === this.BUTTON_BASES_ID || show === this.BUTTON_HIDROLOGY_ID || show === this.BUTTON_PRECIPITATION_ID || show === this.BUTTON_DESPACHO_ID) {
      const EXPANDSIDEMENU_TEMP = this.expandSidemenu;
      this.expandSidemenu = true;
      this.resetModules();
      this.getStateFromButtons(show);
      // Si es la primera vez, debo mostrar el botón colapsar.
      if (this.moduleMemory === '') {
        this.showCollapseButton();
      }
      // Si la variable está cambiando, roto el botón colapsar.
      if (EXPANDSIDEMENU_TEMP !== this.expandSidemenu) {
        this.rotateCollapseButton();
      }

    // Si viene de hamburguesa
    } else if (show.toString().includes('ExpandSidebar')) {
      this.expandSidebar = !this.expandSidebar;
      // Para colapsar
      if (!this.expandSidebar) {
        // Para colapsar cuando está cerrado el sidemenu
        if (this.expandSidemenu) {
          this.expandSidemenu = !this.expandSidemenu;
          this.resetModules();
          this.rotateCollapseButton();
        }
      // Para abrir
      } else {
        // Para abrir cuando está cerrado el sidemenu
        if (!this.expandSidemenu) {
          this.getStateFromCollapseButton(show);
        }
        this.rotateCollapseButton();
      }

    } else {
      // Viene de botón colapsar
      this.expandSidemenu = !this.expandSidemenu;
      this.resetModules();
      this.rotateCollapseButton();
      this.getStateFromCollapseButton(show);
    }
    this.changeState();
    // Muestro o escondo el div "sidemenu"
    const displaySidemenu = this.expandSidemenu ? 'flex' : 'none';
    document.getElementById('sidemenu').style.display = displaySidemenu;
  }


  getStateFromButtons(show: any): void {
    if (show === this.BUTTON_BASES_ID) {
      this.moduleBases = !this.moduleBases;
    } else if (show === this.BUTTON_HIDROLOGY_ID) {
      this.moduleHidrology = !this.moduleHidrology;
    } else if (show === this.BUTTON_PRECIPITATION_ID) {
      this.modulePrecipitation = !this.modulePrecipitation;
    } else if (show === this.BUTTON_DESPACHO_ID) {
      this.moduleDespacho = !this.moduleDespacho;
    }
  }

  getStateFromCollapseButton(show: any): void {
    if (this.expandSidemenu) {
      if (this.moduleMemory === this.MODULE_BASES_ID) {
        this.moduleBases = !this.moduleBases;
      } else if (this.moduleMemory === this.MODULE_HIDROLOGY_ID) {
        this.moduleHidrology = !this.moduleHidrology;
      } else if (this.moduleMemory === this.MODULE_PRECIPITATION_ID) {
        this.modulePrecipitation = !this.modulePrecipitation;
      } else if (this.moduleMemory === this.MODULE_DESPACHO_ID) {
        this.moduleDespacho = !this.moduleDespacho;
      }
    }
  }

  changeState(): void {
    if (this.moduleBases) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_SHOW;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_DESPACHO_ID).style.display = this.MODULES_HIDE;
    } else if (this.moduleHidrology) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_DESPACHO_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_SHOW;
    } else if (this.modulePrecipitation) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_SHOW;
      document.getElementById(this.MODULE_DESPACHO_ID).style.display = this.MODULES_HIDE;
    } else if (this.moduleDespacho) {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_DESPACHO_ID).style.display = this.MODULES_SHOW;
    } else {
      document.getElementById(this.MODULE_BASES_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_HIDROLOGY_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_PRECIPITATION_ID).style.display = this.MODULES_HIDE;
      document.getElementById(this.MODULE_DESPACHO_ID).style.display = this.MODULES_HIDE;
    }
  }

  getLegend(event: any) {
    const legendDiv = document.getElementById('legend');
    legendDiv.classList.toggle('legend-expanded');
    let isExpanded = false;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < legendDiv.classList.length; index++) {
      const element = legendDiv.classList[index];
      if (element === 'legend-expanded') {
        isExpanded = true;
      }
    }
    if (isExpanded) {
      const legendCollapsed = document.getElementById('legendCollapsed');
      legendCollapsed.style.display = 'none';
      const legendExpanded = document.getElementById('legendExpanded');
      legendExpanded.style.display = 'block';
    } else {
      const legendCollapsed = document.getElementById('legendCollapsed');
      legendCollapsed.style.display = 'block';
      const legendExpanded = document.getElementById('legendExpanded');
      legendExpanded.style.display = 'none';
      const legendButton = document.getElementById('buttonCollapseLegend');
      legendButton.style.display = 'block';
    }
  }

}
