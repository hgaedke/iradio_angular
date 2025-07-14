import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";
import { AllowedApps } from "./app-common-types.model";

@Injectable({
    providedIn: 'root',
})
export class AppSelectService {
    private selectedAppSubject = new Subject<AllowedApps>();
    public selectedApp$ = this.selectedAppSubject.asObservable();

    private selectedApp: AllowedApps | undefined;

    selectApp(app: AllowedApps) {
        this.selectedAppSubject.next(app);
    }

    setSelectedApp(app: AllowedApps) {
        this.selectedApp = app;
    }

    getSelectedApp(): AllowedApps | undefined {
        return this.selectedApp;
    }
}