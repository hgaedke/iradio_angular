import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";
import { MusicStatus } from "./app-status.model";
import { ViewMode } from "../app-music/app-music.model";

@Injectable({
    providedIn: 'root',
})
export class MusicControlService {

    private commandSubject = new Subject<string>();
    public command$ = this.commandSubject.asObservable();
    private status? : MusicStatus;

    setCommand(command: string) {
        this.commandSubject.next(command);
    }

    setStatus(status: MusicStatus) {
        this.status = status;
    }

    getStatus(): MusicStatus | undefined {
        return this.status;
    }

    setViewMode(viewMode: ViewMode) {
        const viewModeString = (viewMode === ViewMode.VIEW_MODE_FOLDER) ? 'VIEW_MODE_FOLDER' : 'VIEW_MODE_PLAYBACK';
        if (this.status !== undefined) {
            this.status.viewMode = viewModeString;
        } else {
            this.status = {
                viewMode: viewModeString,
                albumName: undefined,
                currentSongName: undefined,
            }
        }
    }

    setAlbumName(albumName: string) {
        if (this.status !== undefined) {
            this.status.albumName = albumName;
        } else {
            this.status = {
                viewMode: undefined,
                albumName: albumName,
                currentSongName: undefined,
            }
        }
    }

    setCurrentSongName(currentSongName: string) {
        if (this.status !== undefined) {
            this.status.currentSongName = currentSongName;
        } else {
            this.status = {
                viewMode: undefined,
                albumName: undefined,
                currentSongName: currentSongName,
            }
        }
    }

}