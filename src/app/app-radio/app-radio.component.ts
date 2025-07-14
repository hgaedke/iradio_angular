import { Component, computed, ElementRef, inject, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RadioStation } from '../shared/app-radio.model';
import { StationSelectService } from '../shared/station-select-service';
import { Subscription } from 'rxjs/internal/Subscription';

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
export class RadioComponent implements OnInit{
  @Input({required: true}) radioStationsInput! : RadioStation[];
  @Input({required: true}) title!: string;
  @Input({required: true}) instance!: 'radio1' | 'radio2';

  radioStations? : RadioStation[] = undefined; // It makes no sense here to directly assign radioStationsInput here,
                                              // because that one is still undefined on component creation.
                                              // Therefore we assign this only in ngOnChanges().

  activeStation? : RadioStation = undefined;
  
  currentSystemTime? : Date = undefined; // system time, updated on timeupdate of audio element

  @ViewChild('audioElement') audioElement!: ElementRef; // uses the HTMLAudioElement declared in the HTML template for playback

  // watchdog
  private WATCHDOG_NUM_RESTARTS_FOR_STATION_SWITCH : number = 3;
  private WATCHDOG_INTERVAL = 3000; // 3 s
  private intervalFunctionId? : ReturnType<typeof setInterval>; // using type NodeJS.Timeout directly doesn't work :-(
  previousTime? : Date = undefined;
  watchdogRestartCounter : number = 0;

  private LOG_PREFIX: string = '[RADIO_COMPONENT] ';

  private stationSelectService: StationSelectService = inject(StationSelectService);
  private stationSelectSubscription!: Subscription;

  ngOnInit(): void {
    this.stationSelectSubscription = this.stationSelectService.getSelectedRadio1StationObservable(this.instance).subscribe({
      next: (station_number) => {
        try {
          console.log(this.LOG_PREFIX + 'Received message:', station_number);
          this.onSelectStationByNumber(station_number);

        } catch (e) {
          console.error(this.LOG_PREFIX + 'Error processing next value from StationSelectService: ' + e);
        }
      },
      error: (err) => {
        console.error(this.LOG_PREFIX + 'Error in communication with StationSelectService: ' + err);
      },
      complete: () => {
        console.log(this.LOG_PREFIX + 'StationSelectService closed.');
      }
    });
  }

  /**
   * Set up watchdog for automatic station re-init or switch after a number of errors.
   */
  ngAfterContentInit() {
    // setup watchdog
    this.intervalFunctionId = setInterval(this.watchdog, this.WATCHDOG_INTERVAL, this);
    //console.log('setInterval ' + this.intervalFunctionId);
  }

  /**
   * Set radioStations and start playback for first station.
   */
  ngAfterViewInit() {
    // On component creation, radioStationsInput is still undefined. We therefore need to
    // manually detect a radioStationsInput input change and assign the new value to radioStations.
    // (This would be possible in ngOnChanges() as well.)
    this.radioStations = this.radioStationsInput;

    // This cannot be done in ngAfterContentInit, because at that time
    // the audio element does not yet exist.
    this.onSelectStation(this.radioStations[0].id); 
  }

  /**
   * Stops the playback of the currently active station.
   */
  stopActiveStation() {
    if (this.audioElement.nativeElement.src) {
      //console.log('pausing audioElement');
      this.audioElement.nativeElement.pause();
      this.audioElement.nativeElement.currentTime = 0;
      this.audioElement.nativeElement.src = '';
    }
  }

  /**
   * @param currentStationId 
   * @returns The next station, where "next" means the station of the next index
   * (where 0 is the next index after the last element in the radioStations array).
   */
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

  /**
   * Starts the playback for the given station.
   * 
   * @param stationId
   */
  onSelectStation(stationId: string) {
    this.play(stationId);
    this.watchdogRestartCounter = 0;

    const stationNumber = this.getStationNumber(stationId);
    if (stationNumber !== undefined) {
      this.stationSelectService.setSelectedRadioStation(this.instance, stationNumber);
    }
  }

  /**
   * @param stationId 
   * @returns The associated array index of the station in this.radioStations.
   */
  getStationNumber(stationId: string): number | undefined {
    if (this.radioStations) {
      const index = this.radioStations.findIndex((radioStation) => radioStation.id === stationId);
      return index;
    } else {
      return undefined;
    }
  }

  /**
   * Starts the playback for the given station (0..5).
   * 
   * @param station_number
   */
  onSelectStationByNumber(station_number: number) {
    if (this.radioStations && station_number < this.radioStations.length) {
      const radioStation: RadioStation = this.radioStations[station_number];
      this.onSelectStation(radioStation.id);
    }
  }

  /**
   * See css file, container.grid-template-areas.
   * 
   * @param i Cell index, starting with 0.
   * @returns String identifying the cell id.
   */
  computeGridArea(i: number) {
    return 'radio-station' + i;
  }

  /**
   * Stops the currently played audio and starts to play from the station identified by stationId.
   * 
   * @param stationId 
   */
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

  /**
   * Called when a currentTime update to the HTMLAudioElement occurs;
   * practically this happens ca. 2-3 time per s.
   */
  onTimeUpdate() {
    this.currentSystemTime = new Date();
    //console.log('currentTime of audio element: ' + this.audioElement.nativeElement.currentTime);
  }

  /**
   * Cleanup.
   */
  ngOnDestroy() {
    // stop previously played audio
    this.stopActiveStation();

    //console.log('clearInterval ' + this.intervalFunctionId);
    clearInterval(this.intervalFunctionId);

    this.stationSelectSubscription.unsubscribe();
  }

  /**
   * This is run every WATCHDOF_INTERVAL ms (e.g. every 3 s) and checks if
   * currentTime updates have meanwhile occurred on the HTMLAudioElement, i.e.
   * if the audio playback is working.
   * If it is not working, this methods restarts the audio playback.
   * If the audio playback has not worked WATCHDOG_NUM_RESTARTS_FOR_STATION_SWITCH (e.g. 3)
   * times, this method switches the radio station to the next index.
   * 
   * @param radioComponent Reference to this component.
   */
  watchdog(radioComponent: RadioComponent) {
    if (radioComponent.activeStation) {
      if (radioComponent.previousTime === radioComponent.currentSystemTime) {
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

    radioComponent.previousTime = radioComponent.currentSystemTime;
  }
}
