import {Component, Input, OnInit} from '@angular/core';
import {MyEvent} from '../../../models/event.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {v4 as uuidv4} from 'uuid';
import {Observable} from 'rxjs';
import {isBefore, isEqual, isSameDay} from 'date-fns';


@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.css'],
  host: {style: 'display: contents'}
})
export class EventModalComponent implements OnInit {

  @Input() closeModal: () => void;
  @Input() submitEvent: (event: MyEvent) => void;
  @Input() getModalTitle: () => string;
  @Input() mode: string;
  @Input() event: MyEvent | null;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.modalForm =
      (this.event === null || this.event === undefined)
        ? this.formBuilder.group({
          title: ['', [Validators.required, Validators.maxLength(40)]],
          description: ['', [Validators.required, Validators.maxLength(200)]],
          category: ['Event', Validators.required],
          status: ['Planned', Validators.required],
          date: ['', Validators.required]
        })
        : this.formBuilder.group({
          title: [this.event.title, [Validators.required, Validators.maxLength(40)]],
          description: [this.event.description, [Validators.required, Validators.maxLength(200)]],
          category: [this.event.category, Validators.required],
          status: [this.event.status, Validators.required],
          date: [this.event.date, Validators.required]
        });
  }

  modalForm: FormGroup;
  errorsHandler: { show: boolean, errors: { field: string, message: string }[] } = {
    show: false,
    errors: []
  };

  fieldValidations = [
    {
      field: 'title',
      checks: [
        {
          error: 'required',
          message: 'Title is required'
        },
        {
          error: 'maxlength',
          message: 'Maximum 40 characters'
        }
      ]
    },
    {
      field: 'description',
      checks: [
        {
          error: 'required',
          message: 'Description is required'
        },
        {
          error: 'maxlength',
          message: 'Maximum 200 characters'
        }
      ]
    },
    {
      field: 'category',
      checks: [
        {
          error: 'required',
          message: 'Category is required'
        }
      ]
    },
    {
      field: 'status',
      checks: [
        {
          error: 'required',
          message: 'Status is required'
        }
      ]
    },
    {
      field: 'date',
      checks: [
        {
          error: 'required',
          message: 'Date is required'
        }
      ]
    }
  ];

  submitForm() {
    this.errorsHandler = {
      show: true,
      errors: this.getErrors()
    };

    if (this.errorsHandler.errors.length > 0) {
      return;
    }

    this.errorsHandler.show = false;

    const form = this.modalForm.value;

    const event: MyEvent = {
      uid: this.mode === 'add' ? uuidv4() : this.event.uid,
      title: form['title'],
      description: form['description'],
      category: form['category'],
      status: form['status'],
      date: form['date'],
    };

    this.submitEvent(event);
    this.closeModal();
  }

  getError(field: string) {
    const error = this.errorsHandler.errors.find(err => err.field === field);
    return error ? error.message : null;
  }

  private getErrors() {
    const errors: { field: string, message: string }[] = [];

    this.fieldValidations.forEach(({field, checks}) => {
      const fieldControl = this.modalForm.get(field);

      for (const check of checks) {
        if (fieldControl.hasError(check.error)) {
          errors.push({field, message: check.message});
          break;
        }
      }
    });


    const date = new Date(this.modalForm.get('date').value);

    if ((this.mode === 'add'
      && isBefore(date, new Date(Date.now()))
    ) && !isSameDay(date, new Date(Date.now()))) {
      errors.push({field: 'date', message: 'Date can\'t be in past!'});
    }

    return errors;
  }
}
