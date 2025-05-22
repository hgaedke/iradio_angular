import { Component, computed, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RadioStation } from '../shared/app-radio.model';

/**
 * Note that most browsers don't initially play the radio station sound,
 * because all media elements are blocked until the user actively clicks somewhere.
 * When running this on a Raspberry Pi browser, make sure that you have configured it
 * to enable automatic start of media play.
 * If this is not configured, the browser will intially detect play errors and keep
 * on switching to the next station (which is intended).
 */
@Component({
  selector: 'app-radio',
  imports: [DatePipe],
  templateUrl: './app-radio.component.html',
  styleUrl: './app-radio.component.css'
})
export class RadioComponent {
  @Input({required: true}) radioStationsInput! : RadioStation[];
  @Input({required: true}) title!: string;

  radioStations? : RadioStation[] = undefined; // It makes no sense here to directly assign radioStationsInput here,
                                              // because that one is still undefined on component creation.
                                              // Therefore we assign this only in ngOnChanges().

  activeStation? : RadioStation = undefined;
  
  currentTime? : Date = undefined; // system time, updated on timeupdate of audio element

  @ViewChild('audioElement') audioElement!: ElementRef; // uses the HTMLAudioElement declared in the HTML template for playback

  // watchdog
  private WATCHDOG_NUM_RESTARTS_FOR_STATION_SWITCH : number = 3;
  private WATCHDOG_INTERVAL = 3000; // 3 s
  private intervalFunctionId? : ReturnType<typeof setInterval>; // using type NodeJS.Timeout directly doesn't work :-(
  previousTime? : Date = undefined;
  watchdogRestartCounter : number = 0;

  ngAfterContentInit() {
    // setup watchdog
    this.intervalFunctionId = setInterval(this.watchdog, this.WATCHDOG_INTERVAL, this);
    //console.log('setInterval ' + this.intervalFunctionId);
  }

  ngAfterViewInit() {
    // On component creation, radioStationsInput is still undefined. We therefore need to
    // manually detect a radioStationsInput input change and assign the new value to radioStations.
    // (This would be possible in ngOnChanges() as well.)
    this.radioStations = this.radioStationsInput;

    // This cannot be done in ngAfterContentInit, because at that time
    // the audio element does not yet exist.
    this.onSelectStation(this.radioStations[0].id); 
  }

  stopActiveStation() {
    if (this.audioElement.nativeElement.src) {
      //console.log('pausing audioElement');
      this.audioElement.nativeElement.pause();
      this.audioElement.nativeElement.currentTime = 0;
      this.audioElement.nativeElement.src = '';
    }
  }

  getNextStationId(currentStationId : string) {
    let currentIndex : number | undefined = undefined;
    for (let i = 0; i < this.radioStations!.length; ++i) {
      if (this.radioStations![i].id === currentStationId) {
        currentIndex = i;
      }
    }
    if (currentIndex === undefined) {
      return undefined;
    }
    let nextIndex = (currentIndex + 1) % this.radioStations!.length;
    return this.radioStations![nextIndex].id;
  }

  onSelectStation(stationId: string) {
    this.play(stationId);
    this.watchdogRestartCounter = 0;
  }

  play(stationId: string) {
    // stop previously played audio
    this.stopActiveStation();

    const selectedStation = this.radioStations!.filter((station) => station.id === stationId)[0];
    this.audioElement.nativeElement.src = selectedStation.url;
    this.audioElement.nativeElement.load();
    //console.log('play audioElement');
    this.audioElement.nativeElement.play();
    this.onTimeUpdate(); // quick-init the time string

    this.activeStation = selectedStation;
  }

  onTimeUpdate() {
    this.currentTime = new Date();
  }

  ngOnDestroy() {
    // stop previously played audio
    this.stopActiveStation();

    //console.log('clearInterval ' + this.intervalFunctionId);
    clearInterval(this.intervalFunctionId);
  }

  watchdog(radioComponent: RadioComponent) {
    if (radioComponent.activeStation) {
      if (radioComponent.previousTime === radioComponent.currentTime) {
        ++radioComponent.watchdogRestartCounter;
      
        if (radioComponent.watchdogRestartCounter % radioComponent.WATCHDOG_NUM_RESTARTS_FOR_STATION_SWITCH != 0) {
          // playback has stopped => restart it with reinitializing the audio element
          radioComponent.play (radioComponent.activeStation.id);
        } else {
          // WATCHDOG_NUM_RESTARTS_FOR_STATION_SWITCH errors in a row => switch to next radio station (stop current, start next)...
          let nextStationId : string = radioComponent.getNextStationId(radioComponent.activeStation.id) || radioComponent.radioStations![0].id;
          //console.log('next station: ' + nextStationId);
          radioComponent.play(nextStationId);
          
          // ...and reset the watchdog counter
          radioComponent.watchdogRestartCounter = 0;
        }
      }
    }
    radioComponent.previousTime = radioComponent.currentTime;
  }
}
