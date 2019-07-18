import { XmdespachoService } from './../../../services/xmdespacho.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-despacho-popup',
  templateUrl: './despacho-popup.component.html',
  styleUrls: ['./despacho-popup.component.css']
})
export class DespachoPopupComponent implements OnInit {

  constructor( private dwhService: XmdespachoService) {
}

ngOnInit() {
  this.dwhService.getDespachoSin('2019-07-15', '2019-07-16').subscribe(response => {
    console.log('RESPONSE[idSensor]', response);
  });

}
}
