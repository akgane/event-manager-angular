import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MyEvent} from '../models/event.model';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServerHandlerService {
  constructor(private http: HttpClient) {}

  private _serverActionsSubject = new BehaviorSubject({});
  private _serverUrl = 'localhost:8080';

  public serverActions$ = this._serverActionsSubject.asObservable();

  //get request for backend server
  getEvents(){
    return this.http.get("http://" + this._serverUrl + '/get-events')
  }

  //region web socket
  addEvent(event: MyEvent) {
    const ws = new WebSocket('ws://' + this._serverUrl + '/add-event/' + event.uid);

    ws.onopen = () =>{
      ws.send(JSON.stringify({event, action: 'add'}));
    }

    ws.onmessage = (msg) => {
      const data = msg.data as number;

      let serverActions = this._serverActionsSubject.value;
      serverActions = {
        ...serverActions,
        [event.uid]: {
          uid: event.uid, event, action: 'add', progress: data, success: (data >= 100)
        }
      };
      this._serverActionsSubject.next(serverActions);
      if(data >= 100) ws.close();
    }

    const serverActions = this._serverActionsSubject.value;
    serverActions[event.uid] = {uid: event.uid, event, action: 'add', progress: 0, success: false};
    this._serverActionsSubject.next(serverActions);
  }

  editEvent(event: MyEvent){
    const ws = new WebSocket('ws://' + this._serverUrl + '/edit-event/' + event.uid);

    ws.onopen = () => {
      ws.send(JSON.stringify({event, action: 'edit'}));
    }

    ws.onmessage = (msg) => {
      const data = msg.data as number;

      let serverActions = this._serverActionsSubject.value;
      serverActions = {
        ...serverActions,
        [event.uid]: {
          uid: event.uid, event, action: 'edit', progress: data, success: (data >= 100)
        }
      };

      this._serverActionsSubject.next(serverActions);
      if(data >= 100) ws.close();
    }

    const serverActions = this._serverActionsSubject.value;
    serverActions[event.uid] = {uid: event.uid, event, action: 'edit', progress: 0, success: false};
    this._serverActionsSubject.next(serverActions);
  }

  deleteEvent(event: MyEvent){
    const ws = new WebSocket('ws://' + this._serverUrl + '/delete-event/' + event.uid);

    ws.onopen = () => {
      ws.send(JSON.stringify({event, action: 'delete'}));
    }

    ws.onmessage = (msg) => {
      const data = msg.data as number;
      let serverActions = this._serverActionsSubject.value;
      serverActions = {
        ...serverActions,
        [event.uid]: {
          uid: event.uid, event, action: 'delete', progress: data, success: (data >= 100)
        }
      }

      this._serverActionsSubject.next(serverActions);
      if(data >= 100) ws.close();
    }

    const serverActions = this._serverActionsSubject.value;
    serverActions[event.uid] = {uid: event.uid, event, action: 'delete', progress: 0, success: false};
    this._serverActionsSubject.next(serverActions);
  }
  //endregion web socket
}
