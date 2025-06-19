import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private PORT: number = 8082;

  constructor() {
    this.socket$ = webSocket('ws://localhost:' + this.PORT);
  }

  getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  close() {
    this.socket$.complete();
  }
}