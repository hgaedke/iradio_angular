import { inject, Injectable } from "@angular/core";
import { FolderContents } from "./app-music.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class MediaServerAccessService {
    private httpClient = inject(HttpClient);
    private SHOW_FOLDER_URL = 'http://localhost:3000/music/showFolder';
    private STREAM_FILE_URL = 'http://localhost:3000/music/stream';
    
    /**
     * @param relativeDirectory Directory relative to the global music directory.
     * @returns An observable representing the associated HTTP get request.
     */
    getFolderContents(relativeDirectory: string) {
        return this.httpClient.get<FolderContents>(this.SHOW_FOLDER_URL + '?relativeDirectory=' + relativeDirectory);
    }

    /**
     * 
     * @param relativeFilePath File path relative to the global music directory.
     * @returns The URL for streaming that file.
     */
    getFileStreamURL(relativeFilePath: string): string {
        return this.STREAM_FILE_URL + '?relativeFilePath=' + relativeFilePath;
    }
}