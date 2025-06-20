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
    //modal state subscription
    this.eventsService.modalSettings$.subscribe((settings) => {
      this.modalSettings = settings;
    });

    //server actions subscription
    this.eventsService.serverActions$.subscribe((actions) => {
      this.inProgress
        = this.modalSettings.event != null
        && actions[this.modalSettings.event.uid] !== undefined;
      console.log(this.inProgress);
    })
  }

  //region variables

  modalSettings = {
    mode: 'closed',
    event: null
  };
  inProgress = false;

  //endregion variables


  //region functions

  //close modal window
  closeModal = () => {
    this.eventsService.closeModal();
    this.modalSettings = {
      mode: 'closed',
      event: null
    };
    this.inProgress = false;
  }

  //submit form with event
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

  //submit form for event deletion
  submitDeletion = (event: MyEvent) => {
    this.eventsService.deleteEvent(event);
  }

  //get modal window title depending on modal state (mode)
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

  //endregion functions
}
