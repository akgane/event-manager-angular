import {Component, OnInit} from '@angular/core';
import {EventsService} from '../../services/events.service';
import {MyEvent} from '../../models/event.model';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent {
  constructor(private eventsService: EventsService) {
    this.eventsService.modalSettings$.subscribe((settings) => {
      this.modalSettings = settings;
    });
  }

  modalSettings = {
    mode: 'close',
    event: null
  };

  closeModal = () => {
    this.eventsService.closeModal();
  }

  submitEvent = (event: MyEvent) => {
    switch (this.modalSettings.mode) {
      case 'add':
        this.eventsService.addEvent(event);
        break;
      case 'edit':
        this.eventsService.editEvent(event);
        break;
    }
    this.closeModal();
  }

  submitDeletion = (event: MyEvent) => {
    this.eventsService.deleteEvent(event);
    this.closeModal();
  }

  getModalTitle = () => {
    switch (this.modalSettings.mode) {
      case 'add':
        return 'Add Event';
      case 'edit':
        return 'Edit ' + this.modalSettings.event.title;
      case 'delete':
        return 'Delete Event';
    }
    return '';
  }
}
