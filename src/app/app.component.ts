import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./app-menu/app-menu.component";
import { RadioComponent } from './app-radio/app-radio.component';
import { AllowedApps } from './shared/app-common-types.model';
import { RADIO_STATIONS1, RADIO_STATIONS2 } from './shared/app-radio-stations.model';
import { RadioStation } from './shared/app-radio.model';
import { MusicComponent } from './app-music/app-music.component';
import { VideoComponent } from "./app-video/app-video.component";
import { NotificationsComponent } from "./app-notifications/app-notifications.component";
import { CommandsComponent } from "./app-commands/app-commands.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, RadioComponent, MusicComponent, VideoComponent, NotificationsComponent, CommandsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeApp!: AllowedApps;

  radioStations1: RadioStation[] = RADIO_STATIONS1;
  radioStations2: RadioStation[] = RADIO_STATIONS2;

  updateActiveApp(selectedApp: AllowedApps) {
    this.activeApp = selectedApp;
  }
}
