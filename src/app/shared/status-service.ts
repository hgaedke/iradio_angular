import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";
import { AppStatus } from "./app-status.model";

@Injectable({
    providedIn: 'root',
})
export class StatusService {

    private statusSubject = new Subject<AppStatus>();
    public status$ = this.statusSubject.asObservable();

    setSubject(status: AppStatus) {
        this.statusSubject.next(status);
    }

}