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

  //region variables

  categoryFilter ='All';
  statusFilter = 'All';
  pagination = {
    page: 0,
    maxEvents: 10,
    maxPages: 1
  };

  //endregion variables

  //region functions

  changeFilter(field: string, value: string) {
    const newState = this.eventsService.setFilter(field, value);
    this.categoryFilter = newState.category.value;
    this.statusFilter = newState.status.value;
  }

  changeMaxEvents(count: string){
    this.pagination = this.eventsService.setMaxEvents(parseInt(count));
  }

  changePage(next: boolean){
    this.pagination = this.eventsService.changePage(next);
  }

  setPage(page: any){
    const result = this.eventsService.setPage(page.target.value - 1);
    this.pagination = result.pagination;

    page.target.value = result.pagination.page + 1;
  }

  openModal(){
    this.eventsService.openModal('add');
  }

  //endregion functions
}
