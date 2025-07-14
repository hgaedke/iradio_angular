import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

/**
 * Opens a WebSocket to notification_server to receive messages
 * from it.
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private SERVER_URL: string = 'localhost';
  private PORT: number = 8082;

  private webSocket$: WebSocketSubject<any>;

  constructor() {
    this.webSocket$ = webSocket('ws://' + this.SERVER_URL + ':' + this.PORT);
  }

  getMessages(): Observable<any> {
    return this.webSocket$.asObservable();
  }

  send(msg: string) {
    this.webSocket$.next(msg);
  }

  close() {
    this.webSocket$.complete();
  }
}