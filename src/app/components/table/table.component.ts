import { Component, OnInit } from '@angular/core';
import {EventsService} from '../../services/events.service';
import {MyEvent} from '../../models/event.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent{
  constructor(private eventsService: EventsService) {
    this.eventsService.sortedEvents$.subscribe((events) => {
      this.eventsToShow = events;
    })
  }

  //region variables

  sortState = {
    field: '',
    direction: 'asc'
  }
  eventsToShow: MyEvent[] = [];

  //endregion variables

  //region functions

  setSort(field: string){
    this.sortState = this.eventsService.setSort(field);
  }

  getSortSymbol(field: string) {
    return field === this.sortState.field
      ? (this.sortState.direction === 'asc' ? '↑' : '↓')
      : null;
  }

  openModal = (mode: string, event?: MyEvent) => {
    this.eventsService.openModal(mode, event);
  }

  //endregion functions
}
