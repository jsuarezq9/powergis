import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { element } from 'protractor';

@Component({
  selector: 'app-list-elements',
  templateUrl: './list-elements.component.html',
  styleUrls: ['./list-elements.component.css']
})
export class ListElementsComponent implements OnInit {

  @Input() element: any;
  @Output() selected = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  select(select, event) {
    let emitevent = {
      layer: select,
      e: event
    };
    this.selected.emit(emitevent);
  }

}
