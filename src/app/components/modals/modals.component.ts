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

    this.eventsService.serverActions$.subscribe((actions) => {
      this.inProgress
        = this.modalSettings.event != null
        && actions[this.modalSettings.event.uid] !== undefined;
      console.log(this.inProgress);
    })
  }

  modalSettings = {
    mode: 'closed',
    event: null
  };

  inProgress = false;

  closeModal = () => {
    this.eventsService.closeModal();
    this.modalSettings = {
      mode: 'closed',
      event: null
    };
    this.inProgress = false;
  }

  submitEvent = (event: MyEvent) => {
    this.modalSettings.event = event;
    switch (this.modalSettings.mode) {
      case 'add':
        this.eventsService.addEvent(event);
        break;
      case 'edit':
        this.eventsService.editEvent(event);
        break;
    }
  }

  submitDeletion = (event: MyEvent) => {
    this.eventsService.deleteEvent(event);
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
