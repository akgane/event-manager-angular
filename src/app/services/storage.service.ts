import {Injectable, OnInit} from '@angular/core';
import {MyEvent} from '../models/event.model';
import {mockEvents} from '../data/mock-data';
import {delay, map, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _events: MyEvent[] = mockEvents;

  getEvents(): Observable<MyEvent[]> {
    return of([...this._events]).pipe(delay(1000));
  }

  addEvent(event: MyEvent): Observable<MyEvent[]> {
    return of(event).pipe(
      delay(3000),
      map((newEvent) => [newEvent, ...this._events]),
      tap((updatedEvents) => {
        console.log('addEvent', updatedEvents);
        this._events = updatedEvents;
      })
    );
  }

  editEvent(event: MyEvent): Observable<MyEvent[]> {
    return of(event).pipe(
      delay(3000),
      map(() => {
        const updatedEvents = this._events.map(e =>
          e.uid === event.uid ? event : e
        );
        this._events = updatedEvents;
        return updatedEvents;
      }),
      tap(updatedEvents => {
        console.log('editEvent', updatedEvents);
      })
    );
  }

  deleteEvent(event: MyEvent): Observable<MyEvent[]> {
    return of(event).pipe(
      delay(3000),
      map(() => {
        const updatedEvents = this._events.filter(e => e.uid !== event.uid);
        this._events = updatedEvents;
        return updatedEvents;
      }),
      tap(updatedEvents => {
        console.log('deleteEvent', updatedEvents);
      })
    );
  }
}
