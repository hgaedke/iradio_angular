import { inject, Injectable } from "@angular/core";
import { MusicFolderContents } from "../app-music/app-music.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class MediaServerAccessService {
    private MEDIA_BASE_URL: string = 'localhost';
    private MEDIA_PORT: number = 3000;
    private MUSIC_SHOW_FOLDER_URL = 'http://' + this.MEDIA_BASE_URL + ':' + this.MEDIA_PORT + '/music/showFolder';
    private MUSIC_STREAM_FILE_URL = 'http://' + this.MEDIA_BASE_URL + ':' + this.MEDIA_PORT + '/music/stream';
    private VIDEO_SHOW_FOLDER_URL = 'http://' + this.MEDIA_BASE_URL + ':' + this.MEDIA_PORT + '/video/showFolder';
    private VIDEO_STREAM_FILE_URL = 'http://' + this.MEDIA_BASE_URL + ':' + this.MEDIA_PORT + '/video/stream';

    private httpClient = inject(HttpClient);

    /**
     * @param relativeDirectory Directory relative to the global music directory.
     * @returns An observable representing the associated HTTP get request.
     */
    getMusicFolderContents(relativeDirectory: string) {
        return this.httpClient.get<MusicFolderContents>(this.MUSIC_SHOW_FOLDER_URL + '?relativeDirectory=' + relativeDirectory);
    }

    /**
     * 
     * @param relativeFilePath File path relative to the global music directory.
     * @returns The URL for streaming that file.
     */
    getMusicFileStreamURL(relativeFilePath: string): string {
        return this.MUSIC_STREAM_FILE_URL + '?relativeFilePath=' + relativeFilePath;
    }

    /**
     * @returns An observable representing the associated HTTP get request.
     */
    getVideoFolderContents() {
        return this.httpClient.get<MusicFolderContents>(this.VIDEO_SHOW_FOLDER_URL);
    }

    /**
     * 
     * @param relativeFilePath File path relative to the global video directory.
     * @returns The URL for streaming that file.
     */
    getVideoFileStreamURL(relativeFilePath: string): string {
        return this.VIDEO_STREAM_FILE_URL + '?relativeFilePath=' + relativeFilePath;
    }
}