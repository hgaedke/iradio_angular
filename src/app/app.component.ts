import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./app-menu/app-menu.component";
import { RadioComponent } from './app-radio/app-radio.component';
import { AllowedApps } from './shared/app-common-types';
import { RADIO_STATIONS1, RADIO_STATIONS2 } from './shared/app-radio-stations';
import { RadioStation } from './shared/app-radio.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, RadioComponent],
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
