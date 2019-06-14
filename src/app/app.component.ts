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

  // Booleanos del estado de los botones de colapsar de cada módulo
  // collapseBases: boolean;
  // collapseHidrology: boolean;
  // collapsePrecipitation: boolean;
  moduleMemory = '';
  expandSidebar = false;
  expandSidemenu = false;
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

    // Asigno clase de posición en el botón.
    const activePositionButton = this.expandSidemenu ? 'button-collapse-expanded' : 'button-collapse-collapsed';
    const notActivePositionButton = !this.expandSidemenu ? 'button-collapse-expanded' : 'button-collapse-collapsed';
    const button = document.getElementById('buttonCollapse');
    button.classList.add(activePositionButton);
    button.classList.remove(notActivePositionButton);
  }

  showCollapseButton(): void {
    document.getElementById(this.BUTTON_COLLAPSE_DIV_ID).style.display = this.MODULES_SHOW;
  }

  hideCollapseButton(): void {
    document.getElementById(this.BUTTON_COLLAPSE_DIV_ID).style.display = this.MODULES_HIDE;
  }

  getState(show: any): void {
    if (show === this.BUTTON_BASES_ID || show === this.BUTTON_HIDROLOGY_ID || show === this.BUTTON_PRECIPITATION_ID) {
      // Viene de los botones
      const EXPANDSIDEMENU_TEMP = this.expandSidemenu;
      this.expandSidemenu = true;
      this.resetModules();
      this.getStateFromButtons(show);
      // Si la variable está cambiando, roto el botón colapsar.
      if (EXPANDSIDEMENU_TEMP !== this.expandSidemenu) {
        this.rotateCollapseButton();
      }
      // Si es la primera vez, debo mostrarlo
      if (this.moduleMemory === '') {
        this.showCollapseButton();
      }

    // Viene de hamburguesa.
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
          this.expandSidemenu = !this.expandSidemenu;
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
  }

  // rotateIcon() {
  //   this.expandSidebar = !this.expandSidebar;
  //   this.rotation = this.expandSidebar ? 'rotate-90' : 'rotate-0';
  //   const icon = document.getElementById('iconExpandSidebar');
  //   icon.classList.toggle(this.rotation);
  // }


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
    // console.log(show.target.offsetParent.firstElementChild.id); //buttonCollapseDiv
    // console.log('---------------------------');

    if (this.expandSidemenu) {
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
