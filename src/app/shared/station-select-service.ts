import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";

@Injectable({
    providedIn: 'root',
})
export class StationSelectService {

    private selectedRadio1StationSubject = new Subject<number>();
    public selectedRadio1Station$ = this.selectedRadio1StationSubject.asObservable();

    private selectedRadio2StationSubject = new Subject<number>();
    public selectedRadio2Station$ = this.selectedRadio2StationSubject.asObservable();

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
}