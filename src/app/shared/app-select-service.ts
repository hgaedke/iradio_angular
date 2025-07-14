import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";
import { AllowedApps } from "./app-common-types.model";

@Injectable({
    providedIn: 'root',
})
export class AppSelectService {
    private selectedAppSubject = new Subject<AllowedApps>();
    public selectedApp$ = this.selectedAppSubject.asObservable();

    selectApp(app: AllowedApps) {
        this.selectedAppSubject.next(app);
    }
}