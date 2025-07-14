import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private notificationSubject = new Subject<string>();
    public notification$ = this.notificationSubject.asObservable();

    notify(msg: string) {
        this.notificationSubject.next(msg);
    }
}