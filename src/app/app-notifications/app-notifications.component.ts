import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { NotificationService } from '../shared/notification-service';

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

  private notificationService = inject(NotificationService);
  private messagesSubscription!: Subscription;

  private LOG_PREFIX: string = '[NOTIFICATIONS_COMPONENT] ';

  ngOnInit() {
    this.messagesSubscription = this.notificationService.notification$.subscribe({
      next: (msg) => {
        try {
          console.log(this.LOG_PREFIX + 'Received message:', msg);
          const notificationMessage: string = String(msg);

          // calculate display time for the text
          const timeMS: number = Math.max(
            (notificationMessage.length / this.HUMAN_READ_SPEED_NUMBER_OF_CHARS_PER_SECOND) * 1000,
            this.MIN_TIMEOUT_MS
          );

          this.showNotification(notificationMessage, timeMS);

        } catch (e) {
          console.error(this.LOG_PREFIX + 'Error processing next value from NotificationService: ' + e);
        }
      },
      error: (err) => {
        console.error(this.LOG_PREFIX + 'Error in communication with NotificationService: ' + err);
      },
      complete: () => {
        console.log(this.LOG_PREFIX + 'NotificationService closed.');
      }
    });
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
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
