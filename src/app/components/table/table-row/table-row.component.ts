import {Component, Input, OnInit} from '@angular/core';
import {MyEvent} from '../../../models/event.model';

@Component({
  selector: 'app-table-row',
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.css'],
  host: {style: 'display: contents'}
})
export class TableRowComponent {
  @Input() event: MyEvent;
  @Input() index: number;
  @Input() openModal: (mode: string, event?: MyEvent) => void;
}
