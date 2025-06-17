import { Component } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-top-panel',
  templateUrl: './top-panel.component.html',
  styleUrls: ['./top-panel.component.css']
})
export class TopPanelComponent {
  constructor(private eventsService: EventsService) {
    this.pagination = this.eventsService.setMaxEvents(10);
  }

  categoryFilter ='All';
  statusFilter = 'All';
  pagination = {
    page: 0,
    maxEvents: 10,
    maxPages: 1
  };

  changeFilter(field: string, value: string) {
    const newState = this.eventsService.setFilter(field, value);
    this.categoryFilter = newState.category.value;
    this.statusFilter = newState.status.value;
  }

  changeMaxEvents(count: number){
    this.pagination = this.eventsService.setMaxEvents(count);
  }

  changePage(next: boolean){
    this.pagination = this.eventsService.setPage(next);
  }

  openModal(){
    this.eventsService.openModal('add');
  }
}
