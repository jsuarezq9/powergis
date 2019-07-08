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
  isBordered: boolean;
  constructor() { }

  ngOnInit() {
    this.isBordered = false;
  }

  select(select, event) {
    this.selected.emit({
      layer: select,
      e: event
    });
  }
  toggleBorder = () => {
    this.isBordered = !this.isBordered;
  }

}
