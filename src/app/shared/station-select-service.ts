import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";

@Injectable({
    providedIn: 'root',
})
export class StationSelectService {

    private selectedRadio1StationSubject = new Subject<number>();
    public selectedRadio1Station$ = this.selectedRadio1StationSubject.asObservable();
    private selectedRadio1Station? : number;

    private selectedRadio2StationSubject = new Subject<number>();
    public selectedRadio2Station$ = this.selectedRadio2StationSubject.asObservable();
    private selectedRadio2Station? : number;

    selectStation(radioApp: 'radio1' | 'radio2', station: number) {
        if (radioApp ==='radio1') {
            this.selectedRadio1StationSubject.next(station);
        } else {
            this.selectedRadio2StationSubject.next(station);
        }
    }

    getSelectedRadio1StationObservable(instance: 'radio1' | 'radio2') {
        if (instance === 'radio1') {
            return this.selectedRadio1Station$;
        } else {
            return this.selectedRadio2Station$;
        }
    }

    setSelectedRadioStation(instance: 'radio1' | 'radio2', station: number) {
        if (instance === 'radio1') {
            this.setSelectedRadio1Station(station);
        } else {
            this.setSelectedRadio2Station(station);
        }
    }

    getSelectedRadioStation(instance: 'radio1' | 'radio2') : number | undefined {
        if (instance === 'radio1') {
            return this.selectedRadio1Station;
        } else {
            return this.selectedRadio2Station;
        }
    }

    setSelectedRadio1Station(station: number) {
        this.selectedRadio1Station = station;
    }

    getSelectedRadio1Station() : number | undefined {
        return this.selectedRadio1Station;
    }

    setSelectedRadio2Station(station: number) {
        this.selectedRadio2Station = station;
    }

    getSelectedRadio2Station() : number | undefined {
        return this.selectedRadio2Station;
    }
}