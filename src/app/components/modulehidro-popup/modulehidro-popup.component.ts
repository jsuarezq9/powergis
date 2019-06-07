import { Component, OnInit } from '@angular/core';
import { ComponentsInteractionService } from '../../services/interactions.service';

@Component({
  selector: 'app-modulehidro-popup',
  templateUrl: './modulehidro-popup.component.html',
  styleUrls: ['./modulehidro-popup.component.css']
})
export class ModulehidroPopupComponent implements OnInit {

  info: any;

  constructor(private interaction: ComponentsInteractionService) { }
  ngOnInit() {
    // Recibir respuesta de servicio de interacción y determinar acción
    this.interaction.popupInteraction.subscribe((popover: any) => {
      this.info = popover.info;
    });
  }

  decirHola() {
    console.log('HOLA');
  }

}
