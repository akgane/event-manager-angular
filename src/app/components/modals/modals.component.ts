import {Component, OnInit} from '@angular/core';
import {EventsService} from '../../services/events.service';
import {MyEvent} from '../../models/event.model';
import {BehaviorSubject, Observable} from 'rxjs';

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

  private _isLoadingSubject = new BehaviorSubject<boolean>(false);

  modalSettings = {
    mode: 'close',
    event: null
  };


  closeModal = () => {
    // if(!this._isLoadingSubject.value) this.eventsService.closeModal();
    this.eventsService.closeModal();
  }

  submitEvent = (event: MyEvent) => {
    let operation$ : Observable<any>;
    this._isLoadingSubject.next(true);

    switch (this.modalSettings.mode) {
      case 'add':
        operation$ = this.eventsService.addEvent(event);
        break;
      case 'edit':
        operation$ = this.eventsService.editEvent(event);
        break;
      default:
        return;
    }

    operation$.subscribe(() => {
      console.log(123);
      this._isLoadingSubject.next(false);
      this.closeModal();
    })
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
