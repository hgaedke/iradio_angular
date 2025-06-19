import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from './websocket-service';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './app-notifications.component.html',
  styleUrl: './app-notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {

  @ViewChild('notificationDialog') notificationDialog!: ElementRef<HTMLDialogElement>;
  notificationText: string = '';
  destroyRef = inject(DestroyRef);

  private MIN_TIMEOUT_MS: number = 5000;
  private DEFAULT_TIMEOUT_MS: number = this.MIN_TIMEOUT_MS;
  private HUMAN_READ_SPEED_NUMBER_OF_CHARS_PER_SECOND = 17; // assumed human read speed

  private webSocketService = inject(WebSocketService);
  private messagesSubscription!: Subscription;

  ngOnInit() {
    this.messagesSubscription = this.webSocketService.getMessages().subscribe(
      (jsonMessage) => {
        console.log('Received message:', jsonMessage);
        const textMessage = jsonMessage.message;

        // calculate display time for the text
        const timeMS: number = Math.max(
          (textMessage.length / this.HUMAN_READ_SPEED_NUMBER_OF_CHARS_PER_SECOND) * 1000,
          this.MIN_TIMEOUT_MS
        );

        this.showNotification(textMessage, timeMS);
      },
      (err) => console.error(err), () => {
        console.log('WebSocket connection closed');
      }
    );
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
    this.webSocketService.close();
  }

  /**
   * Shows a modal dialog with text text for timeoutMs ms.
   * 
   * @param text 
   * @param timeoutMs 
   */
  showNotification(text: string, timeoutMs: number = this.DEFAULT_TIMEOUT_MS) {
    console.log('showNotification');
    console.log('  text: ' + text);
    console.log('  timeoutMs: ' + timeoutMs);

    this.notificationText = text;
    this.notificationDialog.nativeElement.showModal();
    
    const closeTimeout = setTimeout(() => {
      this.notificationDialog.nativeElement.close();
    }, timeoutMs);

    this.destroyRef.onDestroy(() => {
      clearTimeout(closeTimeout);
    });
  }

}
