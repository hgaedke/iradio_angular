import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";

@Injectable({
    providedIn: 'root',
})
export class VideoControlService {

    private commandSubject = new Subject<string>();
    public command$ = this.commandSubject.asObservable();

    setCommand(command: string) {
        this.commandSubject.next(command);
    }

}