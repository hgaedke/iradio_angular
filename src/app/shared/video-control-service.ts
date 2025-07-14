import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";
import { VideoStatus } from "./app-status.model";

@Injectable({
    providedIn: 'root',
})
export class VideoControlService {

    private commandSubject = new Subject<string>();
    public command$ = this.commandSubject.asObservable();
    private status?: VideoStatus;

    setCommand(command: string) {
        this.commandSubject.next(command);
    }

    setStatus(status: VideoStatus) {
        this.status = status;
    }

    getStatus(): VideoStatus | undefined {
        return this.status;
    }

}