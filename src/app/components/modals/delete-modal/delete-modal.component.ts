import {Component, Input, OnInit} from '@angular/core';
import {MyEvent} from '../../../models/event.model';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css'],
  host: {style: 'display: contents'}
})
export class DeleteModalComponent {
  @Input() event: MyEvent;
  @Input() submitDeletion: (event: MyEvent) => void;
  @Input() closeModal: () => void;
}
