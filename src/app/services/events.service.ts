import {MyEvent} from '../models/event.model';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {isBefore, parseISO} from 'date-fns';
import {Injectable, OnInit} from '@angular/core';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private _eventsSubject = new BehaviorSubject<MyEvent[]>([]);

  private _filters = new BehaviorSubject<{ field: string, value: string }[]>([{
    field: 'category',
    value: 'All'
  }, {
    field: 'status',
    value: 'All'
  }]);

  private _pagination = new BehaviorSubject<{ maxEvents: number, page: number, maxPages: number }>({
    maxEvents: 10,
    page: 0,
    maxPages: Math.ceil(this._eventsSubject.value.length / 10)
  });

  private _sorting = new BehaviorSubject<{ field: string, direction: string }>({
    field: '',
    direction: 'asc',
  });

  private _modalSettings = new BehaviorSubject<{ event: MyEvent | null, mode: string }>({
    event: null,
    mode: 'closed'
  });

  public events$ = this._eventsSubject.asObservable();
  public filters$ = this._filters.asObservable();
  public pagination$ = this._pagination.asObservable();
  public sorting$ = this._sorting.asObservable();

  public modalSettings$ = this._modalSettings.asObservable();

  constructor(private storageService: StorageService) {
    this.setEvents();

    this.events$.subscribe((events) => {
      const p = this._pagination.value;
      this._pagination.next({
        ...p,
        maxPages: Math.ceil(events.length / p.maxEvents)
      })
    })

    // this.events$.subscribe((e) => {
    //   console.log('events$ changed')
    // })
    //
    // this.filteredEvents$.subscribe((e) => {
    //   console.log('filteredEvents$ changed')
    // })
    //
    // this.pagedEvents$.subscribe((e) => {
    //   console.log('pagedEvents$ changed')
    // })
    //
    // this.sortedEvents$.subscribe((e) => {
    //   console.log('sortedEvents$ changed')
    // })
  }

  //region events

  private filteredEvents$ = combineLatest([
    this.events$,
    this.filters$
  ]).pipe(
    map(([events, filters]) => {
      return filters.reduce(
        (filteredEvents, f) => this.filterEvents(filteredEvents, f.field, f.value),
        events
      );
    })
  );

  private pagedEvents$ = combineLatest([
    this.filteredEvents$,
    this.pagination$
  ]).pipe(
    map(([events, pagination]) => {
      return events.slice(pagination.page * pagination.maxEvents, (pagination.page + 1) * pagination.maxEvents);
    })
  );

  public sortedEvents$ = combineLatest([
    this.pagedEvents$,
    this.sorting$
  ]).pipe(
    map(([events, sorting]) => {
      return this.sortEvents(events, sorting.field, sorting.direction);
    })
  );

  //endregion events

  //region gui

  setFilter(field: string, value: string) {
    const newState = this._filters.value.map(f =>
      f.field === field
        ? {field, value: value}
        : f);
    this._filters.next(newState);
    return {category: newState[0], status: newState[1]};
  }

  setMaxEvents(count: number) {
    if (count < 0) {
      return;
    }

    const p = this._pagination.value;
    const newPage = Math.floor((p.page * p.maxEvents) / count);

    const newPaginationState = {
      page: newPage,
      maxPages: Math.ceil(this._eventsSubject.value.length / count),
      maxEvents: count
    };

    this._pagination.next(newPaginationState);
    return {...newPaginationState};
  }

  changePage(next: boolean) {
    const p = this._pagination.value;

    if ((next && p.page === p.maxPages - 1) || (!next && p.page === 0)) {
      return;
    }

    const newPage = (p.page + (next ? 1 : -1));
    const newPaginationState = {
      page: newPage,
      maxPages: p.maxPages,
      maxEvents: p.maxEvents,
    };

    this._pagination.next(newPaginationState);

    return {...newPaginationState};
  }

  setPage(page: number) {
    const p = this._pagination.value;

    if (page < 0) {
      return {changed: !(page < 0 && p.page === 0), pagination: {...p, page: 0}};
    } else if (page >= p.maxPages) {
      return {
        changed: !(page > p.maxPages - 1 && p.page === p.maxPages - 1),
        pagination: {...p, page: p.maxPages - 1}
      };
    } else if (page === p.page) {
      return {changed: false, pagination: {...p}};
    }

    const newPaginationState = {
      page: page,
      maxPages: p.maxPages,
      maxEvents: p.maxEvents,
    };

    this._pagination.next(newPaginationState);
    return {changed: true, pagination: {...newPaginationState}};
  }

  setSort(field: string) {
    const s = this._sorting.value;
    const newState = {
      field,
      direction: s.field === field ? (s.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    };
    this._sorting.next(newState);
    return {...newState};
  }

  //endregion gui

  //region modal

  openModal(mode: string, event?: MyEvent) {
    this._modalSettings.next({
      event: event || null,
      mode
    });
  }

  closeModal() {
    this._modalSettings.next({
      event: null,
      mode: 'closed'
    });
  }

  addEvent(event: MyEvent) : Observable<boolean> {
    // this.storageService.addEvent(event).subscribe(() => {
    //   this.setEvents();
    // })

    return this.storageService.addEvent(event).pipe(
      tap(() => {
        this.setEvents()
      }),
      map(() => true)
    );
  }

  editEvent(event: MyEvent) : Observable<boolean> {
    // this.storageService.editEvent(event).subscribe(() => {
    //   this.setEvents();
    // });

    return this.storageService.editEvent(event).pipe(
      tap(() => {
        this.setEvents()
      }),
      map(() => true)
    );
  }

  deleteEvent(event: MyEvent) {
    this.storageService.deleteEvent(event).subscribe(() => {
      console.log('event deleted');
      this.setEvents();
    })
  }

  private setEvents(){
    this.storageService.getEvents().subscribe(events => {
      this._eventsSubject.next(events);

      const p = this._pagination.value;
      this._pagination.next({
        ...p,
        maxPages: Math.ceil(events.length / p.maxEvents),
      })
    })
  }

  //endregion modal

  //region misc

  filterEvents(events: MyEvent[], field: string, value: string): MyEvent[] {
    switch (field) {
      case 'category':
        return events.filter(e =>
          value === 'All'
            ? true
            : e.category === value);
      case 'status':
        return events.filter(e =>
          value === 'All'
            ? true
            : e.status === value);
      default:
        console.log('Unknown filter field:', field);
        return events;
    }
  }

  sortEvents(events: MyEvent[], field: string, direction: string): MyEvent[] {
    switch (field) {
      case 'title':
        return [...events]
          .sort(
            (a, b) => {
              return direction === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            });
      case 'date':
        return [...events]
          .sort(
            (a, b) => {
              const aValue = parseISO(a.date);
              const bValue = parseISO(b.date);

              return direction === 'asc'
                ? (isBefore(aValue, bValue) ? 0 : 1)
                : (isBefore(bValue, aValue) ? 0 : 1);
            });
      case 'category':
        return [...events]
          .sort(
            (a, b) => {
              return direction === 'asc'
                ? a.category.localeCompare(b.category)
                : b.category.localeCompare(a.category);
            });
      case 'status':
        return [...events]
          .sort(
            (a, b) => {
              return direction === 'asc'
                ? a.status.localeCompare(b.status)
                : b.status.localeCompare(a.status);
            });
      default:
        return [...events];
    }
  }

  //endregion misc

  //region debug

  debugFilters() {
    return this._filters;
  }

  debugPagination() {
    return this._pagination;
  }

  //endregion debug
}
