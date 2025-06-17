import { Component, OnInit } from '@angular/core';
import {EventsService} from '../../services/events.service';

@Component({
  selector: 'app-debug-panel',
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.css']
})
export class DebugPanelComponent{
  constructor(private eventsService: EventsService) { }

  showFilters(){
    console.log(this.eventsService.debugFilters().value);
  }

  showPagination(){
    console.log(this.eventsService.debugPagination().value);
  }
}
