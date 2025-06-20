import {MyEvent} from '../models/event.model';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {isBefore, parseISO} from 'date-fns';
import {Injectable} from '@angular/core';
import {ServerHandlerService} from './server-handler.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  //region observable subjects
  private _eventsSubject = new BehaviorSubject<MyEvent[]>([]);

  private _filtersSubject = new BehaviorSubject<{ field: string, value: string }[]>([{
    field: 'category',
    value: 'All'
  }, {
    field: 'status',
    value: 'All'
  }]);

  private _paginationSubject = new BehaviorSubject<{ maxEvents: number, page: number, maxPages: number }>({
    maxEvents: 10,
    page: 0,
    maxPages: Math.ceil(this._eventsSubject.value.length / 10)
  });

  private _sortingSubject = new BehaviorSubject<{ field: string, direction: string }>({
    field: '',
    direction: 'asc',
  });

  private _modalSettingsSubject = new BehaviorSubject<{ event: MyEvent | null, mode: string }>({
    event: null,
    mode: 'closed'
  });

  private _serverActionsSubject = new BehaviorSubject({});

  //endregion observable subjects

  //region observables

  public events$ = this._eventsSubject.asObservable();
  public filters$ = this._filtersSubject.asObservable();
  public pagination$ = this._paginationSubject.asObservable();
  public sorting$ = this._sortingSubject.asObservable();

  public modalSettings$ = this._modalSettingsSubject.asObservable();
  public serverActions$ = this._serverActionsSubject.asObservable();

  //endregion observables

  constructor(private serverHandlerService: ServerHandlerService,) {
    //get events on application start
    this.serverHandlerService.getEvents().subscribe((res : {events: MyEvent[]}) => {
      if(typeof res.events !== undefined){
        const events = res.events
        this._eventsSubject.next(events);
      }
    })

    //subscription for server actions (add, edit, delete)
    this.serverHandlerService.serverActions$.subscribe((actions) => {
      this._serverActionsSubject.next(actions);
    })
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
    const newState = this._filtersSubject.value.map(f =>
      f.field === field
        ? {field, value: value}
        : f);
    this._filtersSubject.next(newState);
    return {category: newState[0], status: newState[1]};
  }

  setMaxEvents(count: number) {
    if (count < 0) {
      return;
    }

    const p = this._paginationSubject.value;
    const newPage = Math.floor((p.page * p.maxEvents) / count);

    const newPaginationState = {
      page: newPage,
      maxPages: Math.ceil(this._eventsSubject.value.length / count),
      maxEvents: count
    };

    this._paginationSubject.next(newPaginationState);
    return {...newPaginationState};
  }

  //change page (next, previous)
  changePage(next: boolean) {
    const p = this._paginationSubject.value;

    if ((next && p.page === p.maxPages - 1) || (!next && p.page === 0)) {
      return;
    }

    const newPage = (p.page + (next ? 1 : -1));
    const newPaginationState = {
      page: newPage,
      maxPages: p.maxPages,
      maxEvents: p.maxEvents,
    };

    this._paginationSubject.next(newPaginationState);

    return {...newPaginationState};
  }

  //set exact page
  setPage(page: number) {
    const p = this._paginationSubject.value;

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

    this._paginationSubject.next(newPaginationState);
    return {changed: true, pagination: {...newPaginationState}};
  }

  setSort(field: string) {
    const s = this._sortingSubject.value;
    const newState = {
      field,
      direction: s.field === field ? (s.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    };
    this._sortingSubject.next(newState);
    return {...newState};
  }

  //endregion gui

  //region modal

  openModal(mode: string, event?: MyEvent) {
    this._modalSettingsSubject.next({
      event: event || null,
      mode
    });
  }

  closeModal() {
    this._modalSettingsSubject.next({
      event: null,
      mode: 'closed'
    });
  }

  addEvent(event: MyEvent) {
    this._eventsSubject.next([event, ...this._eventsSubject.value]);
    this.serverHandlerService.addEvent(event);
  }

  editEvent(event: MyEvent) {
    this._eventsSubject.next(this._eventsSubject.value.map((e) => e.uid === event.uid ? event : e));
    this.serverHandlerService.editEvent(event);
  }

  deleteEvent(event: MyEvent) {
    this._eventsSubject.next(this._eventsSubject.value.filter(e => e.uid !== event.uid));
    this.serverHandlerService.deleteEvent(event);
    this.closeModal();
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
    return this._filtersSubject;
  }

  debugPagination() {
    return this._paginationSubject;
  }

  //endregion debug
}
