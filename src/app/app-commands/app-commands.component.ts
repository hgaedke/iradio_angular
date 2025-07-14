import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { retry, RetryConfig, Subscription } from 'rxjs';

import { WebSocketService } from './websocket-service';
import { NotificationService } from '../shared/notification-service';
import { AllowedApps } from '../shared/app-common-types.model';
import { AppSelectService } from '../shared/app-select-service';
import { StationSelectService } from '../shared/station-select-service';
import { MusicControlService } from '../shared/music-control-service';
import { VideoControlService } from '../shared/video-control-service';
import { AppStatus, MusicStatus, VideoStatus } from '../shared/app-status.model';

/**
 * Supported commands:
 * 
 * {
 *   "notification": "This is an example notification.",    -> shows the notification on the screen (NotificationService / NotificationsComponent)
 *   "app": "radio1" | "radio2" | "music" | "video",        -> switches to the given app (AppServive / MenuComponent)
 *     "radio1_station": 0..5,                              -> switches the station in app "radio1" to the given number
 *     "radio2_station": 0..5,                              -> switches the station in app "radio2" to the given number
 *     "music": "playNextFile",                             -> control music play inside app "music"; works only inside active album
 *     "video": (not yet implemented),                      -> control video play inside app "video"; not yet implemented
 *   "status": "get",                                       -> request the current status, which will be sent back afterwards
 * }
 * 
 * Status message:
 * 
 * {
 *   "app": "radio1" | "radio2" | "music" | "video",        -> shows the currently active app
 *     "radio1_station": 0..5,                              -> if app radio1 is active, shows the current station number
 *     "radio2_station": 0..5,                              -> if app radio2 is active, shows the current station number
 *     "music": {                                           -> if app music is active, shows information as follows
 *       "viewMode": "VIEW_MODE_FOLDER" | "VIEW_MODE_PLAYBACK",
 *       "albumName": string,
 *       "currentSongName": string,
 *     },
 *     "video": (not yet implemented)                       -> if app music is active, shows information as follows (not yet implemented)
 * }
 */
@Component({
  selector: 'app-commands',
  imports: [],
  templateUrl: './app-commands.component.html',
  styleUrl: './app-commands.component.css'
})
export class CommandsComponent implements OnInit, OnDestroy {

  destroyRef = inject(DestroyRef);

  private webSocketService = inject(WebSocketService);
  private messagesSubscription!: Subscription;
  private RETRY_CONFIG: RetryConfig = {
    delay: 3000,
  };

  private LOG_PREFIX: string = '[COMMANDS_COMPONENT] ';

  private notificationService = inject(NotificationService);
  private appSelectService = inject(AppSelectService);
  private stationSelectService = inject(StationSelectService);
  private musicControlService = inject(MusicControlService);
  private videoControlService = inject(VideoControlService);

  ngOnInit() {
    this.messagesSubscription = this.webSocketService.getMessages().pipe(
      retry(this.RETRY_CONFIG)
    ).subscribe({
      next: (msg) => {
        try {
          console.log(this.LOG_PREFIX + 'Received message:', msg);
          const jsonMessage = JSON.parse(msg);
          if (jsonMessage.notification) { // (suppressing empty string by intent)
            // forward to app-notifications via NotificationService
            const notificationMessage: string = String(jsonMessage.notification);
            this.notificationService.notify(notificationMessage);
          }
          else if (jsonMessage.app) {
            // forward to app-menu via AppSelectService
            const app: AllowedApps = jsonMessage.app;
            this.appSelectService.selectApp(app);
          }
          else if (jsonMessage.radio1_station !== undefined) {
            // forward to app radio1 via StationSelectService
            const station: number = jsonMessage.radio1_station;
            this.stationSelectService.selectStation("radio1", station);
          }
          else if (jsonMessage.radio2_station !== undefined) {
            // forward to app radio2 via StationSelectService
            const station: number = jsonMessage.radio2_station;
            this.stationSelectService.selectStation("radio2", station);
          }
          else if (jsonMessage.music) {
            // forward to app-music via MusicControlService
            const command: string = jsonMessage.music;
            this.musicControlService.setCommand(command);
          }
          else if (jsonMessage.video) {
            // forward to app-video via VideoControlService
            const command: string = jsonMessage.video;
            this.videoControlService.setCommand(command);
          }
          else if (jsonMessage.status === 'get') {
            const app: AllowedApps | undefined = this.appSelectService.getSelectedApp();
            const radio1_station: number | undefined = this.stationSelectService.getSelectedRadio1Station();
            const radio2_station: number | undefined = this.stationSelectService.getSelectedRadio2Station();
            const music: MusicStatus | undefined = this.musicControlService.getStatus();
            const video: VideoStatus | undefined = this.videoControlService.getStatus();
            let status: AppStatus = {
              app,
              radio1_station,
              radio2_station,
              music,
              video,
            };
            const strStatus = JSON.stringify(status);
            console.log(this.LOG_PREFIX + 'Sending status message:', strStatus);
            this.webSocketService.send(strStatus);
          }
          else {
            console.log(this.LOG_PREFIX + 'Ignoring unknown message:', msg);
          }

        } catch (e) {
          console.error(this.LOG_PREFIX + 'Error processing next value: ' + e);
        }
      },
      error: (err) => {
        console.error(this.LOG_PREFIX + 'Error in communication: ' + err);
      },
      complete: () => {
        console.log(this.LOG_PREFIX + 'WebSocket connection closed.');
      }
    });
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
    this.webSocketService.close();
  }

}
